// Read-only website checks; output is research evidence, not website code.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..'),origin='https://www.onestepmy.com';
const evidence=JSON.parse(fs.readFileSync(path.join(__dirname,'technical-evidence.json'),'utf8'));
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
(async()=>{
 const output={checked:'2026-10-06 Asia/Kuala_Lumpur',pages:[],destinations:[],downloads:[],contact:null};
 const destinations=new Set(),downloads=new Set();
 for(const p of evidence.pages){
  const r=await fetch(p.url,{redirect:'manual'}),html=await r.text();
  const local=fs.readFileSync(path.join(root,p.file));
  output.pages.push({url:p.url,status:r.status,canonical:html.match(/rel="canonical" href="([^"]+)/)?.[1]||html.match(/href="([^"]+)" rel="canonical"/)?.[1],localUnchangedSinceOctober5:hash(local)===p.localSha256,liveIdenticalToLocal:hash(html)===hash(local)});
  for(const a of p.live.links){try{const u=new URL(a.href,p.url);if(u.origin===origin){destinations.add(u.pathname);if(/\.pdf$/i.test(u.pathname))downloads.add(u.pathname);}}catch{}}
 }
 for(const pathname of destinations){const clean=decodeURIComponent(pathname),base=path.join(root,clean);const candidates=clean==='/'?[path.join(root,'index.html')]:[base,base+'.html',base+'.php',path.join(base,'index.html')];output.destinations.push({path:pathname,existsLocally:candidates.some(f=>fs.existsSync(f)&&fs.statSync(f).isFile())});}
 for(const p of downloads){const r=await fetch(origin+p,{redirect:'manual'});const b=Buffer.from(await r.arrayBuffer());output.downloads.push({path:p,status:r.status,type:r.headers.get('content-type'),bytes:b.length,pdfSignature:b.subarray(0,5).toString()==='%PDF-'});}
 const c=await fetch(origin+'/contact');const ch=await c.text();output.contact={url:origin+'/contact',status:c.status,formTag:ch.match(/<form[^>]*>/)?.[0],scriptSources:[...ch.matchAll(/<script[^>]+src=["']([^"']+)/g)].map(m=>m[1]),targetPagesLinkingContact:evidence.pages.filter(p=>p.live.links.some(a=>new URL(a.href,p.url).pathname==='/contact')).map(p=>p.url),liveNoAnalyticsScriptInTargetHTML:evidence.pages.every(p=>!p.live.scripts.some(s=>/googletagmanager|google-analytics|plausible|clarity/i.test(s)))};
 fs.writeFileSync(path.join(__dirname,'supplementary-evidence.json'),JSON.stringify(output,null,2)+'\n');
 console.log(JSON.stringify({pages:output.pages,localDestinationCount:output.destinations.length,missing:output.destinations.filter(d=>!d.existsLocally),downloads:output.downloads,contact:output.contact},null,2));
})().catch(e=>{console.error(e);process.exitCode=1});
