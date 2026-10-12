// Research-only: reads GSC exports and writes evidence beside this script.
const fs = require('node:fs');
const path = require('node:path');
function csv(file) {
  const text = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '');
  const rows=[]; let row=[], cell='', quoted=false;
  for(let i=0;i<text.length;i++) {
    const ch=text[i];
    if(ch==='"') { if(quoted && text[i+1]==='"'){cell+='"';i++;} else quoted=!quoted; }
    else if(ch===','&&!quoted){row.push(cell);cell='';}
    else if(ch==='\n'&&!quoted){row.push(cell.replace(/\r$/,'')); if(row.some(Boolean)) rows.push(row);row=[];cell='';}
    else cell+=ch;
  }
  if(cell||row.length){row.push(cell.replace(/\r$/,''));rows.push(row);}
  const headers=rows.shift();
  return rows.map(r=>Object.fromEntries(headers.map((h,i)=>[h,r[i]??''])));
}
const read=(folder,name)=>csv(path.join(__dirname,folder,name+'.csv'));
const sum=(rows,key)=>rows.reduce((n,r)=>n+(Number(r[key])||0),0);
function aggregate(rows, prefix=''){
  const clicks=sum(rows,prefix+'Clicks'), impressions=sum(rows,prefix+'Impressions');
  return {rows:rows.length,clicks,impressions,ctrPercent:impressions?100*clicks/impressions:null,derivedWeightedPosition:impressions?rows.reduce((n,r)=>n+(+r[prefix+'Impressions']||0)*(+r[prefix+'Position']||0),0)/impressions:null};
}
const three=read('gsc-exact10-three-months','Pages');
const comparison=read('gsc-exact10-28day-comparison','Pages');
const queries=read('gsc-exact10-three-months','Queries');
const compareQueries=read('gsc-exact10-28day-comparison','Queries');
const chart=read('gsc-exact10-three-months','Chart');
const allPages=csv(path.join(__dirname,'../../onestepmy.com-Performance-on-Search-2026-10-05/Pages.csv'));
const ids=['alfa','taylors','segi','cityu','inti'];
function targetKey(url){try{const u=new URL(url);if(!/^(www\.)?onestepmy\.com$/.test(u.hostname))return null;let p=u.pathname.replace(/\/{2,}/g,'/').replace(/\.html$/,'').replace(/\/$/,'').replace(/city-university-(fees|details)$/,'cityu-$1');const m=p.match(/^\/(Fees_Chart|Universities)\/(alfa|taylors|segi|cityu|inti)-(fees|details)$/);return m&&((m[1]==='Fees_Chart'&&m[3]==='fees')||(m[1]==='Universities'&&m[3]==='details'))?p:null;}catch{return null;}}
const familyRows=allPages.filter(r=>targetKey(r['Top pages']));
const brand=q=>/\bone[ -]?step\b|onestepmy/i.test(q);
const cluster=q=>brand(q)?'One-Step brand':/\balfa\b/i.test(q)?'ALFA':/taylor/i.test(q)?'Taylors':/\bsegi\b/i.test(q)?'SEGi':/\binti\b/i.test(q)?'INTI':/\bcity\b.*(malaysia|university)|\bcityu\b/i.test(q)?'City University candidate (disambiguation required)':'Other / ambiguous';
const groups={}; for(const q of queries){const k=cluster(q['Top queries']);(groups[k]??=[]).push(q);}
const evidence={captured:'2026-10-06 Asia/Kuala_Lumpur',searchType:'Web',country:'All except where expressly labelled',threeMonthDates:[chart[0].Date,chart.at(-1).Date],comparisonDates:{current:['2026-09-06','2026-10-03'],previous:['2026-08-09','2026-09-05'],verification:'Read directly from GSC date dialog on 6 October 2026'},limitations:['Page, country, device and query CSVs are separate marginal tables, not joinable cross-tabs.','Filtered GSC totals can be partial; country/device/query sums here do not reconcile to Pages totals. Retain original exports and do not infer missing geography or queries.','Weighted positions below are derived from rounded exported rows, not an independent SERP measurement.','Legacy URL family grouping is an analytical view of exported rows, not proof of current Google-selected canonical.'],threeMonthPageSum:aggregate(three),currentPageSum:aggregate(comparison,'Last 28 days '),previousPageSum:aggregate(comparison,'Previous 28 days '),byType:Object.fromEntries(['Fees_Chart','Universities'].map(kind=>[kind,{threeMonth:aggregate(three.filter(r=>r['Top pages'].includes('/'+kind+'/'))),current:aggregate(comparison.filter(r=>r['Top pages'].includes('/'+kind+'/')),'Last 28 days '),previous:aggregate(comparison.filter(r=>r['Top pages'].includes('/'+kind+'/')),'Previous 28 days ')}])),pages:comparison.map(r=>({...r,threeMonth:three.find(t=>t['Top pages']===r['Top pages']),familyThreeMonthRows:familyRows.filter(t=>targetKey(t['Top pages'])===new URL(r['Top pages']).pathname)})),legacyFamilyThreeMonths:aggregate(familyRows),legacyFamilyRows:familyRows,queryClusters:Object.entries(groups).map(([name,rows])=>({name,...aggregate(rows),topByImpressions:rows.toSorted((a,b)=>+b.Impressions-+a.Impressions).slice(0,12)})),queries:compareQueries,countryComparison:read('gsc-exact10-28day-comparison','Countries'),deviceComparison:read('gsc-exact10-28day-comparison','Devices'),countryThreeMonths:read('gsc-exact10-three-months','Countries'),deviceThreeMonths:read('gsc-exact10-three-months','Devices'),chartWindows:[['previous','2026-08-09','2026-09-05'],['current','2026-09-06','2026-10-03'],['postSeptemberDeployment','2026-09-26','2026-10-03']].map(([name,start,end])=>({name,start,end,...aggregate(chart.filter(r=>r.Date>=start&&r.Date<=end))}))};
fs.writeFileSync(path.join(__dirname,'baseline-evidence.json'),JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify({totals:[evidence.threeMonthPageSum,evidence.currentPageSum,evidence.previousPageSum],byType:evidence.byType,family:evidence.legacyFamilyThreeMonths,clusters:evidence.queryClusters,chartWindows:evidence.chartWindows},null,2));
