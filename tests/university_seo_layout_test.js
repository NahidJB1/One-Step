'use strict';
// Verify real content bounds: overflow:hidden can conceal an oversized card.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const {chromium} = require('playwright');
const root = path.resolve(__dirname,'..');
const ids = Object.keys(require('../data/university_seo_content.json'));
const files = ids.flatMap(id=>[`Fees_Chart/${id}-fees.html`,`Universities/${id}-details.html`]);
const server = http.createServer((req,res)=>{
    if(req.method !== 'GET') {res.writeHead(405).end(); return;}
    const file = path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);
    if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()) {res.writeHead(404).end();return;}
    res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript'})[path.extname(file)] || 'application/octet-stream');
    fs.createReadStream(file).pipe(res);
});
(async()=>{
    await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
    const base=`http://127.0.0.1:${server.address().port}`;
    const browser=await chromium.launch();
    let checks=0;
    try {
        const context=await browser.newContext({reducedMotion:'reduce'});
        await context.route('**/*',r=>r.request().url().startsWith(base)?r.continue():r.abort());
        const page=await context.newPage();
        for(const width of [320,390,768,1440]) {
            await page.setViewportSize({width,height:900});
            for(const file of files) {
                await page.goto(`${base}/${file}`,{waitUntil:'load'});
                const bounds=await page.locator('.university-intent').evaluateAll(els=>els.map(e=>{
                    const b=e.getBoundingClientRect();return {id:e.id,left:b.left,right:b.right,available:document.documentElement.clientWidth};
                }));
                assert(bounds.length>=2,`${file}: intent sections present`); checks++;
                assert(bounds.every(b=>b.left>=-1&&b.right<=b.available+1),`${file} at ${width}: ${JSON.stringify(bounds)}`); checks++;
                if(file.startsWith('Fees_Chart/')) await page.locator('.accordion').first().click();
                else {
                    const examples=page.getByText('Programme examples in the stored fee schedule',{exact:true});
                    if(await examples.count()) await examples.click();
                }
                assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${file}: expanded content at ${width}`); checks++;
            }
        }
        console.log(JSON.stringify({passed:checks,pages:files.length,widths:[320,390,768,1440]},null,2));
    } finally {await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
