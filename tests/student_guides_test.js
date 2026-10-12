'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const {chromium}=require('playwright');
const H=require('../scripts/seo_helpers');
const guides=require('../scripts/student_guides')({H,rankings:JSON.parse(H.read('data/university_rankings.json')),fees:JSON.parse(H.read('data/fees_data.json'))});
const files=[...Object.keys(guides.pages),'articles.html'];
const output=path.join(H.root,'.codex-preview','student-guides');
let checks=0;
const ok=(v,m)=>{assert(v,m);checks++;};
const mime={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.webp':'image/webp','.svg':'image/svg+xml','.json':'application/json'};
const server=http.createServer((req,res)=>{
  let requested=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  let file=path.resolve(H.root,'.'+requested+(requested.endsWith('/')?'index.html':''));
  if(!file.startsWith(H.root+path.sep)){res.writeHead(403).end();return;}
  if(!path.extname(file)) file+='.html';
  if(!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404).end();return;}
  res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});fs.createReadStream(file).pipe(res);
});
(async()=>{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const base='http://127.0.0.1:'+server.address().port;
  const browser=await chromium.launch({headless:true});
  fs.mkdirSync(output,{recursive:true});
  const errors=[];const missing=[];
  try {
    const context=await browser.newContext();
    // Deterministic, read-only preview. Third-party ad and animation requests are unnecessary.
    await context.route('**/*',route=>route.request().url().startsWith(base)?route.continue():route.abort());
    const page=await context.newPage();
    page.on('pageerror',e=>{if(!/AOS is not defined/.test(e.message))errors.push(e.message);});
    page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)missing.push(r.url());});
    for(const file of files) {
      await page.goto(base+'/'+file,{waitUntil:'networkidle'});
      ok(await page.locator('h1').count()===1,file+' one H1');
      ok(await page.locator('link[rel="canonical"]').getAttribute('href')===H.urlFor(file),file+' canonical');
      const schema=await page.locator('script[type="application/ld+json"]').evaluateAll(es=>es.flatMap(e=>JSON.parse(e.textContent)['@graph']||[]));
      ok(schema.some(s=>s['@type']===(file==='articles.html'?'CollectionPage':'Article')),file+' schema');
      const links=await page.locator('main a[href]').evaluateAll(es=>es.map(e=>e.getAttribute('href')));
      for(const href of links) {
        const u=new URL(href,base+'/'+file);if(![base,H.origin].includes(u.origin))continue;
        let target=decodeURIComponent(u.pathname).replace(/^\//,'')||'index.html';if(!path.extname(target))target+='.html';
        ok(fs.existsSync(path.join(H.root,target)),file+' destination '+href);
        if(u.hash&&target===file)ok(await page.locator('[id="'+decodeURIComponent(u.hash.slice(1))+'"]').count()===1,file+' anchor '+href);
      }
      if(file!=='articles.html') {
        ok(await page.locator('.guide-table').count()>0,file+' useful comparison table');
        ok(await page.locator('.guide-content img').count()>=2,file+' photo grid');
        ok(await page.locator('.guide-button[href^="/"]').count()>=4,file+' internal calls to action');
        await page.locator('.guide-faq summary').first().click();
        ok(await page.locator('.guide-faq').first().getAttribute('open')!==null,file+' FAQ opens');
        ok(await page.locator('.guide-byline time').getAttribute('datetime')==='2026-09-21',file+' editorial review date');
      } else {
        ok(await page.locator('.article-card').count()===12,'12 unique article cards');
        for(const f of Object.keys(guides.pages))ok(await page.locator('.article-card[href="'+f.replace('.html','')+'"]').count()===1,'Hub card '+f);
      }
      for(const width of [1440,768,390,320]) {
        await page.setViewportSize({width,height:960});
        // Trigger all lazy images without disabling the production loading behaviour.
        for(const img of await page.locator('main img').all())await img.scrollIntoViewIfNeeded();
        await page.evaluate(async()=>Promise.all([...document.querySelectorAll('main img')].map(i=>i.decode().catch(()=>{}))));
        const badImages=await page.locator('main img').evaluateAll(es=>es.filter(e=>!e.naturalWidth).map(e=>e.src));
        ok(badImages.length===0,file+' loaded images '+width+': '+badImages.join(','));
        ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),file+' no page overflow '+width);
        await page.evaluate(()=>scrollTo(0,0));
        if([1440,390].includes(width))await page.screenshot({path:path.join(output,path.basename(file,'.html')+'-'+width+'.png'),fullPage:true});
      }
    }
    await page.goto(base+'/Articles/cost-of-living-malaysia-international-students');
    const values=await page.locator('.guide-bar-row strong').allTextContents();
    ok(values.map(v=>Number(v.replace('RM',''))).reduce((a,b)=>a+b,0)===1800,'Budget chart sums to RM1800');
    ok((await page.locator('#budget').innerText()).includes('RM23,760'),'Annual budget plus buffer arithmetic');
    await page.goto(base+'/Articles/top-10-universities-in-malaysia');
    ok(await page.locator('.guide-campus').count()===10,'10 covered universities');
    const names=await page.locator('.guide-campus h3').allTextContents();
    ok(!names.some(n=>/Sunway|PETRONAS|Sains Malaysia|Kebangsaan|Malaya \(UM\)/.test(n)),'Shortlist restricted to covered universities');
    ok(errors.length===0,'No runtime errors: '+errors.join('; '));
    ok(missing.length===0,'No missing local resources: '+missing.join('; '));
    const nojs=await browser.newContext({javaScriptEnabled:false});
    await nojs.route('**/*',r=>r.request().url().startsWith(base)?r.continue():r.abort());
    const staticPage=await nojs.newPage();
    for(const file of Object.keys(guides.pages)) {
      await staticPage.goto(base+'/'+file);
      ok(await staticPage.locator('h1').isVisible(),file+' heading without JavaScript');
      ok(await staticPage.locator('.guide-table table').first().isVisible(),file+' table without JavaScript');
    }
    const result={passed:checks,pages:files.length,widths:[1440,768,390,320],screenshots:output};
    fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(result,null,2));
    console.log(JSON.stringify(result,null,2));
  } finally {await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
