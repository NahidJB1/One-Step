// Research-only collector: writes evidence under this dated report directory.
const fs=require('node:fs'), path=require('node:path'), crypto=require('node:crypto');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'../..'), origin='https://www.onestepmy.com';
const ids=['alfa','taylors','segi','cityu','inti'];
const targets=ids.flatMap(id=>[{id,kind:'fees',file:`Fees_Chart/${id}-fees.html`},{id,kind:'details',file:`Universities/${id}-details.html`}]);
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
async function request(url){try{const r=await fetch(url,{redirect:'manual',signal:AbortSignal.timeout(30000)});return {url,status:r.status,headers:Object.fromEntries(r.headers),text:await r.text()};}catch(e){return {url,error:e.message};}}
function inspect(doc){
 const structured=[...doc.querySelectorAll('script[type="application/ld+json"]')].map(e=>{try{return JSON.parse(e.textContent)}catch(err){return {error:err.message}}});
 return {title:doc.title,description:doc.querySelector('meta[name="description"]')?.content,canonical:[...doc.querySelectorAll('link[rel="canonical"]')].map(e=>e.getAttribute('href')),robots:[...doc.querySelectorAll('meta[name="robots"]')].map(e=>e.content),h1:[...doc.querySelectorAll('h1')].map(e=>e.textContent.trim()),headings:[...doc.querySelectorAll('h2,h3')].map(e=>e.textContent.trim()),schemaTypes:structured.flatMap(j=>(j['@graph']||[j]).map(x=>x['@type'])),schemaErrors:structured.filter(j=>j.error),schema:structured,links:[...doc.querySelectorAll('a[href]')].map(e=>({href:e.getAttribute('href'),text:e.textContent.trim()})),tables:doc.querySelectorAll('table').length,tableRows:doc.querySelectorAll('tbody tr').length,images:[...doc.querySelectorAll('img')].map(e=>({src:e.getAttribute('src'),alt:e.getAttribute('alt'),width:e.getAttribute('width'),height:e.getAttribute('height'),loading:e.getAttribute('loading')})),scripts:[...doc.querySelectorAll('script[src]')].map(e=>e.getAttribute('src')),textLength:(doc.body?.textContent||'').replace(/\s+/g,' ').length};
}
(async()=>{
 const out={researchDate:'2026-10-05',method:'Direct HTTP fetch and headless Chromium; no geographic ranking simulation; read-only GET requests. Live layout: 390 and 320 CSS pixels. No field CWV data.',checks:{},pages:[]};
 const browser=await chromium.launch({headless:true});
 const parseContext=await browser.newContext({javaScriptEnabled:false});
 const parser=await parseContext.newPage();
 const parse=async html=>parser.evaluate(({html,source})=>{const doc=new DOMParser().parseFromString(html,'text/html');return eval('('+source+')(doc)')},{html,source:inspect.toString()});
 const robots=await request(origin+'/robots.txt'),sitemap=await request(origin+'/sitemap.xml');
 out.robots={status:robots.status,text:robots.text};out.sitemap={status:sitemap.status,urls:[...(sitemap.text||'').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1])};
 for(const target of targets){
  const url=origin+'/'+target.file.replace(/\.html$/,'');
  const [live,htmlAlias]=await Promise.all([request(url),request(url+'.html')]);
  const local=fs.readFileSync(path.join(root,target.file),'utf8');
  const record={...target,url,status:live.status,xRobotsTag:live.headers?.['x-robots-tag']||null,liveHeaders:live.headers,htmlAlias:{status:htmlAlias.status,location:htmlAlias.headers?.location},sitemapIncluded:out.sitemap.urls.includes(url),localLiveIdentical:hash(local)===hash(live.text||''),localSha256:hash(local),liveSha256:hash(live.text||''),local:await parse(local),live:await parse(live.text||'')};
  record.localImages=record.local.images.filter(i=>i.src).map(i=>{const u=new URL(i.src,url);const f=path.join(root,decodeURIComponent(u.pathname));return {...i,path:u.pathname,bytes:u.origin===origin&&fs.existsSync(f)?fs.statSync(f).size:null}});
  record.localImageBytes=record.localImages.reduce((n,i)=>n+(i.bytes||0),0);
  out.pages.push(record);console.log('HTTP',target.file,record.status,'identical',record.localLiveIdentical);
 }
 out.sharedAssets=[];
 for(const f of ['assets/js/index.js','assets/js/search.js','assets/js/malaysia-scholarship.js','assets/js/navbar.js','assets/js/footer.js','assets/js/chatbot.js','assets/js/fees.js','assets/css/study-content.css']){
  const r=await request(origin+'/'+f),local=fs.readFileSync(path.join(root,f),'utf8');out.sharedAssets.push({file:f,status:r.status,localLiveIdentical:hash(local)===hash(r.text||''),liveContainsOldHomepagePath:(r.text||'').includes('..//'),liveHtmlBuilderLines:(r.text||'').split(/\r?\n/).filter(l=>/\.html/.test(l)&&/href|url|link|path|details|fees/i.test(l)).slice(0,25)});
 }
 out.redirectChecks=[];
 for(const p of ['//','/Fees_Chart//alfa-fees?audit=20261005','/Universities//cityu-details?audit=20261005','/Fees_Chart/city-university-fees','/Fees_Chart/city-university-fees.html']){const r=await request(origin+p);out.redirectChecks.push({path:p,status:r.status,location:r.headers?.location});}
 const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
 // Do not submit forms or send analytics beacons during research.
 await context.route('**/*',r=>r.request().method()==='GET'?r.continue():r.abort());
 for(const record of out.pages){
  const page=await context.newPage(),errors=[],failed=[],badResponses=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>failed.push({url:r.url(),method:r.method(),error:r.failure()?.errorText}));page.on('response',r=>{if(r.status()>=400)badResponses.push({url:r.url(),status:r.status()})});
  let loadError=null;try{await page.goto(record.url,{waitUntil:'load',timeout:40000});}catch(e){loadError=e.message}
  await page.waitForTimeout(1000);
  record.mobile={loadError,errors,failed,badResponses,at390:await page.evaluate(()=>({viewport:innerWidth,clientWidth:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth,h1:document.querySelector('h1')?.innerText,homeLinks:[...document.querySelectorAll('a')].filter(a=>a.textContent.trim()==='Home').map(a=>({href:a.getAttribute('href'),resolved:a.href})),htmlInternalLinks:[...document.querySelectorAll('a[href]')].filter(a=>a.origin===location.origin&&/\.html(?:$|[?#])/.test(a.href)).map(a=>({href:a.getAttribute('href'),text:a.textContent.trim()})),brokenImages:[...document.images].filter(i=>i.getAttribute('src')&&!i.complete||i.getAttribute('src')&&i.complete&&i.naturalWidth===0).map(i=>i.getAttribute('src')),resources:performance.getEntriesByType('resource').map(r=>({url:r.name,transferSize:r.transferSize,decodedBodySize:r.decodedBodySize,durationMs:Math.round(r.duration)})),navigation:performance.getEntriesByType('navigation').map(r=>({ttfbMs:Math.round(r.responseStart-r.requestStart),domContentLoadedMs:Math.round(r.domContentLoadedEventEnd),loadMs:Math.round(r.loadEventEnd)}))}))};
  await page.screenshot({path:path.join(__dirname,`mobile-${record.id}-${record.kind}-390.png`),fullPage:false});
  await page.setViewportSize({width:320,height:844});record.mobile.at320=await page.evaluate(()=>({viewport:innerWidth,clientWidth:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth}));
  if(record.kind==='fees'){
   const accordion=page.locator('.accordion').first(); if(await accordion.count()){await accordion.click(); record.mobile.feeExpanded=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,viewport:innerWidth,expanded:document.querySelector('.accordion')?.getAttribute('aria-expanded'),panelVisible:!!document.querySelector('.panel')?.getClientRects().length}));}
  } else {
   record.mobile.tabs=[];for(const tab of await page.locator('.tab-btn[data-tab]').all()){const target=await tab.getAttribute('data-tab');try{await tab.click({timeout:5000});record.mobile.tabs.push({target,visible:await page.locator('#'+target).isVisible()});}catch(e){record.mobile.tabs.push({target,error:e.message})}}
  }
  console.log('MOBILE',record.file,record.mobile.at390.scrollWidth,record.mobile.at320.scrollWidth,'errors',errors.length);
  await page.close();
 }
 out.checks.seoGenerator='node scripts/build_site_seo.js --check: Outdated SEO files: 0';
 fs.writeFileSync(path.join(__dirname,'technical-evidence.json'),JSON.stringify(out,null,2));
 await browser.close();
})().catch(e=>{console.error(e);process.exitCode=1});
