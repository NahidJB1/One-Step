'use strict';
// Browser checks use local files and mocked scholarship submissions only.
// Rewrite checks exercise the actual .htaccess regexes with PHP's PCRE engine;
// they do not substitute for an Apache/Hostinger HTTP integration check.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const {execFileSync} = require('node:child_process');
const {chromium} = require('playwright');
const root = path.resolve(__dirname, '..');
let checks = 0, submissions = 0;
const eq = (actual, expected, label) => { assert.deepEqual(actual, expected, label); checks++; };
const ok = (value, label) => { assert(value, label); checks++; };
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const htaccess = read('.htaccess');
const slashBlock = htaccess.split('# Normalize literal repeated slashes')[1].split('# Send known production aliases')[0];
const rules = [...slashBlock.matchAll(/RewriteCond %\{THE_REQUEST\} "([^"]+)"\r?\nRewriteRule \^ (\S+) \[([^\]]+)\]/g)].map(([,pattern,target,flags])=>({pattern,target,flags}));
eq(rules.length, 2, 'Raw external request slash rules');
rules.forEach(r => eq(r.flags, 'R=308,L,NE', 'Permanent method-preserving redirect and raw percent escapes'));
function normalize(request) {
    const matches = JSON.parse(execFileSync('php', ['-r', '$v=json_decode(stream_get_contents(STDIN),true);$out=[];foreach($v["rules"] as $r){$m=[];preg_match("~".$r["pattern"]."~",$v["request"],$m);$out[]=$m;}echo json_encode($out);'], {input:JSON.stringify({rules,request}),encoding:'utf8'}));
    const i = matches.findIndex(m=>m.length);
    if (i < 0) return null;
    const target = rules[i].target.replace(/%(\d)/g, (_,n)=>matches[i][Number(n)] || '');
    const raw = request.split(' ')[1];
    return target + (raw.includes('?') ? raw.slice(raw.indexOf('?')) : '');
}
const cases = [
    ['//','/'], ['///','/'], ['/Fees_Chart//alfa-fees','/Fees_Chart/alfa-fees'],
    ['/Universities//apu-details','/Universities/apu-details'], ['/Articles//cheapest-universities','/Articles/cheapest-universities'],
    ['/Fees_Chart//alfa-fees?q=business%20management&next=https://example.com//x','/Fees_Chart/alfa-fees?q=business%20management&next=https://example.com//x'],
    ['//Fees_Chart///alfa-fees','/Fees_Chart/alfa-fees'],
    ['/Fees_Chart//city-university-fees.html?q=a%2Fb&next=https://example.com//x','/Fees_Chart/city-university-fees.html?q=a%2Fb&next=https://example.com//x'],
    ['/assets//a%20b%23c%25%252F.txt','/assets/a%20b%23c%25%252F.txt'],
    ['/assets//a%2F%2Fb%3Fc.txt','/assets/a%2F%2Fb%3Fc.txt'],
    ['/api//chat.php?x=%2F','/api/chat.php?x=%2F'],
    ['/Fees_Chart/alfa-fees?next=https://example.com//x','/Fees_Chart/alfa-fees?next=https://example.com//x'],
    ['/assets/a%2F%2Fb.txt','/assets/a%2F%2Fb.txt'], ['/','/']
];
for (const [input,expected] of cases) {
    let current=input, seen=new Set();
    for (let i=0;i<10;i++) {
        ok(!seen.has(current), 'No redirect loop: '+input); seen.add(current);
        const next=normalize('GET '+current+' HTTP/1.1');
        if(next===null) break;
        current=next;
    }
    eq(current,expected,'PCRE normalized path and preserved query: '+input);
    eq(normalize('GET '+current+' HTTP/1.1'),null,'Canonical path has no slash redirect');
}
eq(normalize('POST /api//chat.php?x=1 HTTP/1.1'),'/api/chat.php?x=1','API POST path normalization');
eq(normalize('GET https://example.com/x HTTP/1.1'),null,'No scheme syntax normalization');

const destinations = new Set();
function checkLinks(links, base, label) {
    for (const href of links) {
        let u;
        try { u=new URL(href,base); } catch(error) {
            if (/^(?:https?:|mailto:|tel:)/i.test(href)) continue;
            throw error;
        }
        if(u.origin!==new URL(base).origin) continue;
        ok(!u.pathname.endsWith('.html'),label+' clean URL: '+href);
        ok(!u.pathname.includes('//'),label+' single slash: '+href);
        const local=u.pathname==='/'?'index.html':decodeURIComponent(u.pathname.slice(1));
        const file=path.extname(local)?local:local+'.html';
        ok(fs.existsSync(path.join(root,file)),label+' destination exists: '+href);
        if(file.endsWith('.html')) destinations.add(u.pathname+u.search);
    }
}
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg'};
const server=http.createServer((req,res)=>{
    // HTTP harness for the PCRE-tested slash rules, not an Apache replacement.
    if(req.url.split('?')[0].includes('//')) {
        const target=normalize(req.method+' '+req.url+' HTTP/1.1');
        if(target!==null){res.writeHead(308,{Location:target}).end();return;}
    }
    if(req.method!=='GET'){res.writeHead(405).end();return;}
    const pathname=new URL(req.url,'http://localhost').pathname;
    let local=pathname==='/'?'index.html':decodeURIComponent(pathname.slice(1));
    if(!path.extname(local))local+='.html';
    const file=path.resolve(root,local);
    if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404).end();return;}
    res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});
    fs.createReadStream(file).pipe(res);
});
(async()=>{
    let browser;
    try {
        await new Promise(r=>server.listen(0,'127.0.0.1',r));
        const base='http://127.0.0.1:'+server.address().port;
        const httpCases=cases.filter(([p])=>!p.includes('city-university')&&!p.startsWith('/assets/')&&!p.startsWith('/api/')).concat([
            ['/assets//css/index.css?v=%252F','/assets/css/index.css?v=%252F'],
            ['/assets//css/%69ndex.css?v=1','/assets/css/%69ndex.css?v=1']
        ]);
        for(const [input,expected] of httpCases) {
            let current=input,seen=new Set();
            for(let i=0;i<10;i++) {
                ok(!seen.has(current),'HTTP harness no redirect loop');seen.add(current);
                const response=await fetch(base+current,{redirect:'manual'});
                if(response.status!==308){eq(response.status,200,'HTTP harness final canonical 200');await response.body.cancel();break;}
                const target=response.headers.get('location');
                eq(target,normalize('GET '+current+' HTTP/1.1'),'HTTP harness exact Location');
                await response.body.cancel();current=target;
            }
            eq(current,expected,'HTTP harness normalized destination');
        }
        browser=await chromium.launch({headless:true});
        const context=await browser.newContext();
        await context.route('**/*',route=>{
            const req=route.request();
            if(req.url()===base+'/submit_malaysia_scholarship.php') {
                submissions++;return route.fulfill({status:200,contentType:'application/json',body:'{"status":"success"}'});
            }
            if(req.method()!=='GET'||!req.url().startsWith(base+'/'))return route.abort();
            return route.continue();
        });
        const page=await context.newPage();
        for(const p of ['/','/Fees_Chart/alfa-fees','/Universities/apu-details','/Articles/cheapest-universities']) {
            await page.goto(base+p,{waitUntil:'networkidle'});
            eq(await page.locator('.main-header .logo').getAttribute('href'),'/','Logo Home '+p);
            eq(await page.locator('.main-header .nav-link').first().getAttribute('href'),'/','Navbar Home '+p);
            eq(await page.locator('.main-footer a').filter({hasText:/^Home$/}).getAttribute('href'),'/','Footer Home '+p);
            const links=await page.locator('.main-header a[href], .main-footer a[href]').evaluateAll(es=>es.map(e=>e.getAttribute('href')));
            checkLinks(links,base+p,'Shared navigation');
        }
        for(const p of ['/','/explore-universities']) {
            await page.goto(base+p,{waitUntil:'networkidle'});
            const cards=await page.locator('.university-card a').evaluateAll(es=>es.map(e=>e.getAttribute('href')));
            ok(cards.length>0,'Rendered university cards '+p);checkLinks(cards,base+p,'Cards');
            ok(cards.includes('/Universities/cityu-details'),'CityU profile card');
            ok(cards.includes('/Fees_Chart/cityu-fees'),'CityU fee card');
        }
        for(const p of ['/','/search']) {
            await page.goto(base+p,{waitUntil:'networkidle'});
            await page.fill('#programSearchInput','business');
            await page.evaluate(()=>triggerSearch());
            const links=await page.locator('#searchResults a').evaluateAll(es=>es.map(e=>e.getAttribute('href')));
            ok(links.length>0,'Rendered search results '+p);checkLinks(links,base+p,'Search');
            ok(links.every(h=>new URL(h,base).searchParams.has('q')),'Program query retained');
            await page.fill('#programSearchInput','City University');await page.evaluate(()=>triggerSearch());
            const city=await page.locator('#searchResults a').evaluateAll(es=>es.map(e=>e.getAttribute('href')));
            ok(city.length>0&&city.every(h=>h.startsWith('/Fees_Chart/cityu-fees?')),'CityU search mapping');
        }
        await page.goto(base+'/quiz',{waitUntil:'networkidle'});
        await page.evaluate(()=>{userAnswers.location='any';showResults();});
        const quiz=await page.locator('.match-action a').evaluateAll(es=>es.map(e=>e.getAttribute('href')));
        eq(quiz.length,3,'Rendered quiz results');checkLinks(quiz,base+'/quiz','Quiz');
        await page.goto(base+'/malaysia-scholarship',{waitUntil:'networkidle'});
        const universities=await page.locator('#university option').evaluateAll(es=>es.filter(e=>e.value).map(e=>({value:e.value,key:e.dataset.key})));
        for(const uni of universities) {
            await page.evaluate(()=>{document.querySelector('#formView').style.display='block';});
            await page.selectOption('#university',uni.value);
            await page.evaluate(()=>{document.querySelector('#dashboardView').style.display='none';document.querySelector('#scholarshipForm').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));});
            await page.waitForFunction(()=>document.querySelector('#dashboardView').style.display==='block');
            const result=await page.locator('#btnUniDetail,#btnUniFees').evaluateAll(es=>es.map(e=>e.getAttribute('href')));
            checkLinks(result,base+'/malaysia-scholarship','Scholarship '+uni.value);
            if(uni.key==='City University Malaysia') eq(result,['/Universities/cityu-details','/Fees_Chart/cityu-fees'],'CityU scholarship mapping');
        }
        eq(submissions,universities.length,'All scholarship POSTs mocked');
        await context.addInitScript(()=>localStorage.setItem('os_chat_history',JSON.stringify([{
            role:'bot',text:'[CityU](Fees_Chart/city-university-fees.html?q=business%20management#fee-category-0)',
            buttons:[{label:'Profile',url:'Universities/cityu-details.html'}],
            sources:[{title:'APU',url:'Fees_Chart/apu-fees.html'},{title:'China',url:'countries/china.html'}]
        }])));
        await page.goto(base+'/Universities/apu-details',{waitUntil:'networkidle'});
        const chat=await page.locator('.os-message.bot a').evaluateAll(es=>es.map(e=>e.getAttribute('href')));
        eq(chat.length,4,'Rendered chatbot markdown, button and sources');
        checkLinks(chat,base+'/Universities/apu-details','Chatbot');
        ok(chat.some(h=>h.includes('/Fees_Chart/cityu-fees?q=business%20management#fee-category-0')),'Rendered chatbot CityU alias/query/fragment');
        for(const href of destinations) {
            const response=await context.request.get(base+href,{maxRedirects:0});
            eq(response.status(),200,'Local generated destination 200: '+href);
        }
        const sitemap=[...read('sitemap.xml').matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>new URL(m[1]).pathname);
        for(const href of sitemap) {
            const response=await context.request.get(base+href,{maxRedirects:0});
            eq(response.status(),200,'Canonical sitemap destination 200: '+href);
        }
        for(const p of ['/','/Fees_Chart/alfa-fees','/Universities/apu-details','/Articles/cheapest-universities']) {
            await page.goto(base+p,{waitUntil:'networkidle'});
            for(const width of [320,390,768,1024,1440]) {
                await page.setViewportSize({width,height:900});
                eq(await page.locator('.main-header .nav-link').first().getAttribute('href'),'/','Responsive Home href');
            }
        }
        console.log(JSON.stringify({passed:checks,generatedDestinations:destinations.size,sitemapDestinations:sitemap.length,mockedScholarships:submissions,slashVerification:'PHP PCRE and HTTP harness; native Apache HTTP verification still required'},null,2));
    } finally {
        await browser?.close();await new Promise(r=>server.close(r));
    }
})().catch(e=>{console.error(e);process.exitCode=1;});
