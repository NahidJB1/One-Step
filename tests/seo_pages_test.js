'use strict';
// Integration checks against real local HTML and Chromium. No submissions or remote APIs.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const os = require('node:os');
const {chromium} = require('playwright');
const H = require('../scripts/seo_helpers');
const {root,read,plain} = H;
const data = JSON.parse(read('data/fees_data.json'));
const ranking = JSON.parse(read('data/university_rankings.json'));
const priorityIds = Object.keys(JSON.parse(read('data/university_seo_content.json')));
const originalControls = JSON.parse(read('tests/seo_preserved_controls.json'));
const snapshotDir = path.join(os.tmpdir(),'onestep-seo-page-checks');
const normalize = text => plain(text).replace(/\s+/g,' ').trim();
const selectedIds = (process.env.SEO_PAGE_IDS || '').split(',').filter(Boolean);
if (selectedIds.some(id=>!data[id==='cityu'?'city-university':id])) throw new Error('Unknown SEO_PAGE_IDS selection');
const files = ['index.html','explore-universities.html','articles.html','contact.html', ...['Fees_Chart','Universities','Articles'].flatMap(dir=>fs.readdirSync(path.join(root,dir)).filter(f=>f.endsWith('.html')).map(f=>dir+'/'+f))].filter(file=>!selectedIds.length || selectedIds.some(id=>file===`Fees_Chart/${id}-fees.html` || file===`Universities/${id}-details.html`));
const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.pdf':'application/pdf','.zip':'application/zip'};
let checks=0;
const ok = (value,message) => { assert(value,message); checks++; };
const eq = (a,b,message) => { assert.deepEqual(a,b,message); checks++; };
(async()=>{
    const server = http.createServer((req,res)=>{
        if (req.method !== 'GET') {res.writeHead(405).end();return;}
        let requested;
        try {requested=decodeURIComponent(new URL(req.url,'http://localhost').pathname);} catch {res.writeHead(400).end();return;}
        let file = path.resolve(root,'.'+requested+(requested.endsWith('/') ? 'index.html' : ''));
        if (!file.startsWith(root+path.sep)) {res.writeHead(403).end();return;}
        if (!path.extname(file)) file += '.html';
        if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {res.writeHead(404).end('Not found');return;}
        res.writeHead(200,{'Content-Type':mime[path.extname(file)] || 'application/octet-stream'});
        fs.createReadStream(file).pipe(res);
    });
    await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
    const base='http://127.0.0.1:'+server.address().port;
    let browser;
    const broken=[];
    const priorityTitles = new Set(), priorityDescriptions = new Set();
    try {
        browser = await chromium.launch({headless:true});
        const context = await browser.newContext({javaScriptEnabled:false,viewport:{width:1440,height:1000}});
        // No external assets are needed for parsing, metadata or source parity checks.
        await context.route('**/*',route=>route.request().url().startsWith(base) ? route.continue() : route.abort());
        const page=await context.newPage();
        for (const file of files) {
            eq((await page.goto(base+'/'+file,{waitUntil:'domcontentloaded'})).status(),200,file);
            eq(await page.locator('title').count(),1,file+' title count');
            eq(await page.locator('h1').count(),1,file+' h1 count');
            eq(await page.locator('meta[name="description"]').count(),1,file+' description count');
            eq(await page.locator('link[rel="canonical"]').count(),1,file+' canonical count');
            eq(await page.locator('link[rel="canonical"]').getAttribute('href'),H.urlFor(file),file+' canonical');
            const schema = await page.locator('script[type="application/ld+json"]').evaluateAll(els=>els.flatMap(el=>{const j=JSON.parse(el.textContent);return j['@graph'] || [j];}));
            ok(schema.length>0,file+' valid schema');
            const links=await page.locator('a[href]').evaluateAll(els=>els.map(e=>e.getAttribute('href')));
            const priorityId = priorityIds.find(id => file === `Fees_Chart/${id}-fees.html` || file === `Universities/${id}-details.html`);
            if (priorityId) {
                const title = await page.title();
                const description = await page.locator('meta[name="description"]').getAttribute('content');
                ok(!priorityTitles.has(title),file+' unique intent title'); priorityTitles.add(title);
                ok(!priorityDescriptions.has(description),file+' unique description'); priorityDescriptions.add(description);
                ok(!/Malaysia Malaysia/i.test(title),file+' no repeated location');
                if (file.startsWith('Universities/')) {
                    ok(!/\bfees?\b|tuition/i.test(title),file+' detail title keeps financial intent separate');
                    ok(!/Visa Approval|Avg Fee \(Bachelor\)/.test(await page.locator('body').innerText()),file+' no unsourced visa rates or aggregate fees');
                    ok(links.includes(`/Fees_Chart/${priorityId}-fees`),file+' links to fee owner');
                    eq(await page.locator('#courses-intakes, #bangladesh-entry, #scholarships').count(),3,file+' course intake and eligibility sections');
                } else {
                    ok(/fees|tuition/i.test(title),file+' financial intent title');
                    ok(links.includes(`/Universities/${priorityId}-details`),file+' links to detail owner');
                    ok(await page.locator('#payment-planning').isVisible(),file+' payment guidance without JavaScript');
                }
                // Validate every new local fragment, including cross-page programme links.
                const newLinks=await page.locator('.university-intent a[href]').evaluateAll(els=>els.map(e=>e.getAttribute('href')));
                for (const href of newLinks) {
                    const url=new URL(href,base+'/'+file);
                    if (url.origin !== base || !url.hash) continue;
                    const target=decodeURIComponent(url.pathname).replace(/^\//,'').replace(/\.html$/,'')+'.html';
                    ok(read(target).includes(`id="${decodeURIComponent(url.hash.slice(1))}"`),file+' existing target '+href);
                }
            }
            for (const href of links) {
                const url=new URL(href,base+'/'+file);
                if (![base,H.origin].includes(url.origin)) continue;
                if (/\.php$/.test(url.pathname)) continue;
                let local=decodeURIComponent(url.pathname).replace(/^\//,'') || 'index.html';
                if (!path.extname(local)) local+='.html';
                if (!fs.existsSync(path.join(root,local))) broken.push(`${file} -> ${href}`);
            }
            if (file.startsWith('Fees_Chart/')) {
                const id=path.basename(file,'-fees.html');
                const uni=data[id==='cityu'?'city-university':id];
                const faq = await page.locator('#faq .study-faq').evaluateAll(els=>els.map(el=>({q:el.querySelector('summary').textContent,a:el.querySelector('p').textContent})));
                eq(schema.find(s=>s['@type']==='FAQPage').mainEntity.map(q=>({q:q.name,a:q.acceptedAnswer.text})),faq,file+' visible FAQs match schema');
                eq(faq.length,6,file+' FAQ count');
                ok(await page.locator('#fees-guide').isVisible(),file+' guidance is visible without JS');
                eq(await page.locator('#seo-content, #static-faq, .popular-queries-section').count(),0,file+' obsolete hidden SEO removed');
                if (await page.locator('#dynamicFeesContainer').count()) {
                    const actual=await page.locator('#dynamicFeesContainer table').evaluateAll(tables=>tables.map(t=>({headers:[...t.querySelectorAll('thead th')].map(c=>c.innerHTML),rows:[...t.querySelectorAll('tbody tr')].map(r=>[...r.cells].map(c=>c.innerHTML))})));
                    const expected=uni.categories.filter(c=>c.table?.rows?.length).map(c=>({headers:c.table.headers.map(normalize),rows:c.table.rows.map(r=>r.map(normalize))}));
                    eq(actual.map(t=>({headers:t.headers.map(normalize),rows:t.rows.map(r=>r.map(normalize))})),expected,file+' every source cell preserved');
                    const noteText=normalize(await page.locator('#dynamicFeesContainer').innerText());
                    for(const cat of uni.categories)for(const key of ['initial_fees','other_fees','notes','remarks'])if(cat[key])ok(noteText.includes(normalize(cat[key])),file+' '+key+' preserved');
                    ok(await page.locator('#dynamicFeesContainer table').first().isVisible(),file+' table readable without JavaScript');
                } else {
                    eq(await page.locator('.panel table').count(),id==='cyberjaya'?5:1,file+' authored fee tables preserved');
                }
            }
            if(file.startsWith('Universities/')) {
                const id=path.basename(file,'-details.html');
                eq(await page.locator('.ranking-faq').count(),4,file+' existing ranking FAQ preserved');
                eq(await page.locator('#rankings time').getAttribute('datetime'),ranking.verified_at,file+' ranking verification date preserved');
                eq((read(file).match(/<(?:button|input|select|textarea|iframe)\b[^>]*>/gi)||[]).map(s=>s.replace(/\r\n/g,'\n')),originalControls[file].map(s=>s.replace(/\r\n/g,'\n')),file+' original controls preserved');
                const faq=await page.locator('.ranking-faq').evaluateAll(els=>els.map(el=>({q:el.querySelector('summary').textContent,a:el.querySelector('p').textContent})));
                eq(schema.find(s=>s['@type']==='FAQPage').mainEntity.map(q=>({q:q.name,a:q.acceptedAnswer.text})),faq,file+' ranking schema matches visible answer');
            }
        }
        eq([...new Set(broken)],[],'Broken internal links');
        const sitemap=[...read('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
        eq(new Set(sitemap).size,sitemap.length,'Unique sitemap entries');
        for(const file of files)ok(sitemap.includes(H.urlFor(file)),file+' in sitemap');
        ok(!sitemap.some(url=>/\.html|\.php|bot_tester|\/tests\//.test(url)),'Sitemap uses public canonical URLs');
        await context.close();
        const interactive=await browser.newContext({viewport:{width:1440,height:1000}});
        await interactive.route('**/*',route=>route.request().method()==='GET' ? route.continue() : route.abort());
        const live=await interactive.newPage();
        const errors=[];
        live.on('pageerror',error=>errors.push(error.message));
        fs.mkdirSync(snapshotDir,{recursive:true});
        for(const id of (selectedIds.length ? selectedIds : [...priorityIds,'cybernetics','genovasi','upm','utm'])) {
            const requests=[];const onRequest=req=>requests.push(req.url());live.on('request',onRequest);
            await live.goto(base+'/Fees_Chart/'+id+'-fees.html',{waitUntil:'networkidle'});
            ok(await live.locator('body').getAttribute('data-fees-initialized'),id+' enhancement initialized');
            ok(!requests.some(url=>url.includes('fees_data.json')),id+' no full fee-database download');
            live.off('request',onRequest);
            const sourceTitle=plain(read('Fees_Chart/'+id+'-fees.html').match(/<title>([^<]+)<\/title>/)[1]);
            eq(await live.title(),sourceTitle,id+' title stable after JavaScript');
            const button=live.locator('.accordion').first();
            if(await button.count()) {
                await button.click();eq(await button.getAttribute('aria-expanded'),'true',id+' expand');
                await button.click();eq(await button.getAttribute('aria-expanded'),'false',id+' collapse');
            }
            const sample=await live.locator('.panel table td').filter({hasText:/business|engineering|science|management/i}).first().textContent();
            await live.locator('#searchInput').fill(sample.trim());
            ok(await live.locator('.panel tr.highlight:visible').count()>0,id+' program search');
            await live.locator('#searchInput').fill('no-such-program-zzzz');
            eq(await live.locator('#fee-search-status').textContent(),'0 matching fee rows.',id+' no results');
            await live.locator('#searchInput').fill('');
            if (priorityIds.includes(id)) {
                const sectionLink=live.locator('#fees-guide a[href="#fee-category-0"]');
                await live.locator('#fees-guide summary').click();
                await sectionLink.click();
                ok(await live.locator('#fee-category-0').isVisible(),id+' same-page section link opens table');
                // Repeat the same hash after collapsing, then after filtering out all rows.
                await button.click();
                await sectionLink.click();
                ok(await live.locator('#fee-category-0').isVisible(),id+' repeated section link reopens table');
                await live.locator('#searchInput').fill('no-such-program-zzzz');
                await sectionLink.click();
                eq(await live.locator('#searchInput').inputValue(),'',id+' section link clears conflicting filter');
                ok(await live.locator('#fee-category-0 tr').last().isVisible(),id+' linked rows restored');
            }
            await live.locator('#faqToggleBtn').click();
            await live.locator('#faq summary').first().click();
            ok(await live.locator('#faq .study-faq p').first().isVisible(),id+' FAQ button and expansion');
            if (['apu','cityu','cybernetics'].includes(id)) {
                const link=live.locator('#faq a[download]').first();
                const href=await link.getAttribute('href');
                const downloadEvent=live.waitForEvent('download');
                await link.click();
                const download=await downloadEvent;
                eq(download.suggestedFilename(),path.basename(href),id+' fee download filename');
                eq(await download.failure(),null,id+' fee document downloads successfully');
            }
            await live.setViewportSize({width:390,height:844});
            ok(await live.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),id+' mobile page width');
            if(['apu','cityu','cybernetics'].includes(id)) {
                await live.screenshot({path:path.join(snapshotDir,id+'-mobile.png'),fullPage:true});
                await live.evaluate(()=>scrollTo(0,0));
                await live.screenshot({path:path.join(snapshotDir,id+'-mobile-top.png')});
            }
            await live.setViewportSize({width:1440,height:1000});
        }
        await live.goto(base+'/Fees_Chart/apu-fees.html?q=100%25',{waitUntil:'networkidle'});
        eq(await live.locator('#searchInput').inputValue(),'100%','Encoded percentage search does not crash');
        for(const file of [...priorityIds.map(id=>`Universities/${id}-details.html`),'Articles/top-10-universities-in-malaysia.html','Articles/cheapest-universities.html','explore-universities.html']) {
            await live.goto(base+'/'+file,{waitUntil:'networkidle'});
            if(file.startsWith('Universities') && await live.locator('[data-tab="campus"]').count()) {
                await live.locator('[data-tab="campus"]').click();ok(await live.locator('#campus').isVisible(),'Campus tab works');
                await live.locator('[data-tab="overview"]').click();ok(await live.locator('#overview').isVisible(),'Overview tab works');
            }
            await live.setViewportSize({width:390,height:844});
            ok(await live.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),file+' mobile width');
            await live.screenshot({path:path.join(snapshotDir,path.basename(file,'.html')+'-mobile.png'),fullPage:true});
            await live.evaluate(()=>scrollTo(0,0));
            await live.screenshot({path:path.join(snapshotDir,path.basename(file,'.html')+'-mobile-top.png')});
            await live.setViewportSize({width:1440,height:1000});
        }
        eq(errors,[],'Uncaught browser errors');
        console.log(JSON.stringify({passed:checks,pages:files.length,sitemapEntries:sitemap.length,screenshots:snapshotDir},null,2));
    } finally { if(browser)await browser.close(); await new Promise(resolve=>server.close(resolve)); }
})().catch(error=>{console.error(error);process.exitCode=1;});
