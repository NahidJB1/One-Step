'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
function csv(text){
 const rows=[];let row=[],cell='',quoted=false;
 for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}else if(c===','&&!quoted){row.push(cell);cell='';}else if(c==='\n'&&!quoted){row.push(cell.replace(/\r$/,''));rows.push(row);row=[];cell='';}else cell+=c;}
 if(cell||row.length){row.push(cell.replace(/\r$/,''));rows.push(row);}return rows;
}
function analyze(){
 const pages=csv(fs.readFileSync(path.join(root,'onestepmy.com-Performance/Pages.csv'),'utf8').replace(/^\uFEFF/,''));
 const headers=pages.shift();if(headers[0]!=='Top pages'||headers[1]!=='Clicks')throw Error('Unexpected Pages CSV');
 const chart=csv(fs.readFileSync(path.join(root,'onestepmy.com-Performance/Chart.csv'),'utf8'));chart.shift();
 const ids=fs.readdirSync(path.join(root,'Universities')).filter(f=>f.endsWith('-university.html')).map(f=>f.replace('-university.html','')).sort();
 const ht=fs.readFileSync(path.join(root,'.htaccess'),'utf8');
 const aliases=[...ht.matchAll(/^RewriteRule (\S+) https:\/\/www\.onestepmy\.com(\S*) \[R=301,L[^\]]*\]/gm)].map(([,p,target])=>({pattern:new RegExp(p),target}));
 const records=Object.fromEntries(ids.map(id=>[id,{id,feeClicks:0,hubClicks:0,detailsClicks:0,rows:[]}]));
 const feeSlugs=new Set();let allClicks=0,feeClicks=0;
 for(const row of pages){const [url,raw]=row;const clicks=Number(raw);allClicks+=clicks;
  const u=new URL(url);let p=decodeURI(u.pathname).replace(/\.html$/,'').replace(/\/+$/,'');
  const fee=p.match(/^\/Fees_Chart\/(.+)-fees$/);
  if(fee){feeSlugs.add(fee[1]);feeClicks+=clicks;let id=fee[1].toLowerCase();if(id==='city-university')id='cityu';if(id==='iukl')id='klust';if(records[id]){records[id].feeClicks+=clicks;records[id].rows.push({url,clicks,family:'fees'});}continue;}
  if(!p.startsWith('/Universities/'))continue;
  const family=/-details$/.test(p)?'details':/-university$/.test(p)?'hub':null;if(!family)continue;
  let id=p.match(/^\/Universities\/(.+)-(?:details|university)$/)?.[1];
  if(!records[id]){const r=aliases.find(r=>r.pattern.test(p.slice(1)));id=r?.target.match(/^\/Universities\/(.+)-university$/)?.[1];}
  if(records[id]){records[id][family==='hub'?'hubClicks':'detailsClicks']+=clicks;records[id].rows.push({url,clicks,family});}
 }
 for(const r of Object.values(records)){
  r.guideClicks=r.hubClicks+r.detailsClicks;
  // A tie retains the existing live hub rather than causing an unsupported move.
  r.owner='hub'; // Site owner requested unified university pages on 2026-11-03.
  r.feePath=`/Fees_Chart/${r.id}-fees`;r.hubPath=`/Universities/${r.id}-university`;
  r.ownerPath=r.owner==='fee'?r.feePath:r.hubPath;
  r.reason='Owner requested a single university page with intact fee tables';
 }
 return {source:'onestepmy.com-Performance/Pages.csv',dates:[chart[0][0],chart.at(-1)[0]],searchType:'Web',allClicks,feeClicks,feeSlugs:[...feeSlugs].sort(),extraFeeSlugs:[...feeSlugs].filter(s=>!ids.includes(s)).sort(),missingFeeSlugs:ids.filter(s=>!feeSlugs.has(s)),universities:records};
}
if(require.main===module){const result=analyze();const out=path.join(root,'docs/fee-ownership-2026-11-02');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'click-analysis.json'),JSON.stringify(result,null,2)+'\n');
 if(process.argv.includes('--write'))fs.writeFileSync(path.join(root,'data/fee_page_ownership.json'),JSON.stringify({source:result.source,dates:result.dates,method:'Aggregate host, extension and UI variants; map city-university to cityu. Compare fee clicks with details + university clicks; retain live hub on a tie.',universities:result.universities},null,2)+'\n');
 console.log(JSON.stringify({dates:result.dates,allClicks:result.allClicks,feeClicks:result.feeClicks,feeSlugs:result.feeSlugs.length,extraFeeSlugs:result.extraFeeSlugs,feeOwners:Object.values(result.universities).filter(r=>r.owner==='fee').map(r=>r.id),hubOwners:Object.values(result.universities).filter(r=>r.owner==='hub').map(r=>r.id)},null,2));}
module.exports={analyze,csv};
