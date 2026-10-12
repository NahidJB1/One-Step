// Local QA and diff evidence for the approved scope; no live requests/submissions.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),http=require('node:http'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {spawnSync}=require('node:child_process');const {chromium}=require('playwright');
const root=path.resolve(__dirname,'../..'),before=path.join(os.tmpdir(),'onestep-scope-a-20261006-before');
const ids=['alfa','taylors','segi','cityu','inti'];const pages=ids.flatMap(id=>[`Fees_Chart/${id}-fees.html`,`Universities/${id}-details.html`]);
const sourceFiles=['data/university_seo_content.json','scripts/build_site_seo.js','scripts/university_seo_content.js','tests/seo_pages_test.js','tests/seo_preserved_controls.json'];
const read=(base,file)=>fs.readFileSync(path.join(base,file),'utf8');const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
let checks=0;const ok=(v,m)=>{assert(v,m);checks++};const eq=(a,b,m)=>{assert.deepEqual(a,b,m);checks++};
(async()=>{
 const result={date:'2026-10-06',approvedPages:pages,checks:[],screenshots:[],externalConcurrentChanges:[]};
 const manifest=JSON.parse(read(before,'manifest.json'));
 const expected=new Set([...pages,...sourceFiles]);
 for(const [file,entry] of Object.entries(manifest.files)){
  if(fs.existsSync(path.join(root,file))&&hash(fs.readFileSync(path.join(root,file)))!==entry.sha256&&!expected.has(file))result.externalConcurrentChanges.push(file);
 }
 const protectedFiles=['data/fees_data.json','data/university_rankings.json','sitemap.xml','.htaccess','assets/js/index.js','assets/js/search.js','assets/js/malaysia-scholarship.js','assets/js/navbar.js','assets/js/footer.js','assets/js/chatbot.js','assets/js/fees.js'];
 for(const file of protectedFiles)eq(hash(fs.readFileSync(path.join(root,file))),manifest.files[file].sha256,file+' unchanged');
 const oldData=JSON.parse(read(before,'data/university_seo_content.json')),newData=JSON.parse(read(root,'data/university_seo_content.json'));
 for(const id of Object.keys(oldData)){
  if(!ids.includes(id))eq(newData[id],oldData[id],id+' editorial record unchanged');
  for(const field of ['fee_title','detail_title','fee_description','detail_description','bangladesh'])eq(newData[id][field],oldData[id][field],id+' '+field+' preserved');
 }
 const controls=JSON.parse(read(root,'tests/seo_preserved_controls.json')),oldControls=JSON.parse(read(before,'tests/seo_preserved_controls.json'));
 for(const file of Object.keys(controls)){const omitMap=x=>x.filter(s=>!s.startsWith('<iframe'));eq(omitMap(controls[file]),omitMap(oldControls[file]),file+' non-map controls unchanged');if(!['alfa','segi','inti','cityu'].some(id=>file===`Universities/${id}-details.html`))eq(controls[file],oldControls[file],file+' full control fixture unchanged');}
 for(const file of pages){const old=read(before,file),now=read(root,file);for(const re of [/<title>[\s\S]*?<\/title>/,/<meta name="description"[^>]*>/,/<link rel="canonical"[^>]*>/])eq(now.match(re)?.[0],old.match(re)?.[0],file+' metadata preserved');if(file.startsWith('Universities/')){for(const re of [/<!-- rankings:content:start -->[\s\S]*?<!-- rankings:content:end -->/,/<!-- rankings:seo:start -->[\s\S]*?<!-- rankings:seo:end -->/])eq(now.match(re)?.[0],old.match(re)?.[0],file+' ranking block preserved');}}
 let diff='';for(const file of [...pages,...sourceFiles]){const r=spawnSync('git',['diff','--no-index','--',path.join(before,file),path.join(root,file)],{encoding:'utf8',windowsHide:true});ok(r.status===0||r.status===1,file+' diff available');diff+=r.stdout;}
 fs.writeFileSync(path.join(__dirname,'full-scope-a.diff'),diff);
 const server=http.createServer((req,res)=>{if(req.method!=='GET'){res.writeHead(405).end();return;}let p=new URL(req.url,'http://localhost').pathname;let f=path.resolve(root,'.'+p);if(!path.extname(f))f+='.html';if(!f.startsWith(root+path.sep)||!fs.existsSync(f)){res.writeHead(404).end();return;}const type={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.json':'application/json'}[path.extname(f)];if(type)res.setHeader('Content-Type',type);fs.createReadStream(f).pipe(res);});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base=`http://127.0.0.1:${server.address().port}`;const browser=await chromium.launch();
 try{const context=await browser.newContext({reducedMotion:'reduce'});await context.route('**/*',r=>r.request().url().startsWith(base)?r.continue():r.abort());await context.addInitScript(()=>{window.AOS={init(){}}});const page=await context.newPage();
  for(const width of [390,1024]){await page.setViewportSize({width,height:900});for(const id of ids){
   await page.goto(base+`/Universities/${id}-details`,{waitUntil:'load'});await page.locator('#courses-intakes').scrollIntoViewIfNeeded();
   const table=page.locator('[aria-label="Verified programme references"]');ok(await table.isVisible(),id+' direct-source table visible');ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),id+' table outer bounds '+width);
   if(width===390){ok(await table.evaluate(el=>el.scrollWidth>el.clientWidth),id+' mobile table can scroll');ok(await table.evaluate(el=>{el.scrollLeft=el.scrollWidth;const moved=el.scrollLeft>0;el.scrollLeft=0;return moved;}),id+' last columns reachable');}
   await table.locator('caption').scrollIntoViewIfNeeded();const p=`${id}-programmes-${width}.png`;await page.screenshot({path:path.join(__dirname,p)});result.screenshots.push(p);
   if(['alfa','segi','inti','cityu'].includes(id)){const src=await page.locator('#location iframe').getAttribute('src');ok(!src.includes('Lakeside')&&!src.includes('pb='),id+' copied/synthetic map removed');ok(await page.locator('#location iframe').getAttribute('title'),id+' map has accessible title');}
   await page.goto(base+`/Fees_Chart/${id}-fees`,{waitUntil:'load'});await page.locator('.accordion').first().click();const label=page.locator('.fee-provenance').first();await label.locator('summary').click();await label.scrollIntoViewIfNeeded();ok(await label.locator('p').first().isVisible(),id+' source label usable');eq(await page.locator('.fee-provenance').count(),require(path.join(root,'data/fees_data.json'))[id==='cityu'?'city-university':id].categories.length,id+' every section labelled');
   const fp=`${id}-fee-source-${width}.png`;await page.screenshot({path:path.join(__dirname,fp)});result.screenshots.push(fp);
  }}
 }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
 result.passed=checks;result.protectedFiles=protectedFiles;result.diff='full-scope-a.diff';fs.writeFileSync(path.join(__dirname,'validation-evidence.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({passed:checks,screenshots:result.screenshots.length,externalConcurrentChanges:result.externalConcurrentChanges,protectedFiles:protectedFiles.length},null,2));
})().catch(e=>{console.error(e);process.exitCode=1});
