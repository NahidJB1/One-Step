'use strict';
const H=require('./seo_helpers');
const editorial=require('../data/university_seo_content.json');
const {esc,plain,documentLink}=H;
// Read exact labelled columns; never convert total costs into annual instalments.
function ranges(uni){
 const result=[];
 for(const category of uni.categories){
  const level=plain(category.category_name);
  if(!/foundation|diploma|bachelor|master|doctor|ph\.?d/i.test(level))continue;
  const headers=category.table?.headers||[];
  for(let i=0;i<headers.length;i++){
   const label=plain(headers[i]);
   if(!/tuition|total|year\s*1|1st\s*year|first\s*year/i.test(label)||/semester|duration|number|initial|resource/i.test(label))continue;
   const values=(category.table.rows||[]).map(r=>plain(r[i])).filter(v=>/^(?:RM|MYR)\s*[\d,]+(?:\.\d+)?$/i.test(v)).map(v=>Number(v.replace(/^(?:RM|MYR)\s*/i,'').replaceAll(',','')));
   if(!values.length)continue;
   const min=Math.min(...values),max=Math.max(...values),fmt=n=>n.toLocaleString('en-US',{maximumFractionDigits:2});
   result.push({level,label,text:`RM ${fmt(min)}${max!==min?'–'+fmt(max):''}`});
   break;
  }
 }
 return result;
}
function docs(uni){return [...new Map([uni.file_link,...uni.categories.map(c=>c.pdf_link)].map(documentLink).filter(Boolean).map(d=>[d.href,d])).values()];}
function summary(id,uni){
 const rs=ranges(uni),source=editorial[id]?.fee_provenance;
 const initial=[...new Set(uni.categories.flatMap(c=>[c.initial_fees,c.other_fees,c.notes,c.remarks]).filter(Boolean).map(plain).flatMap(t=>t.match(/Total Initial Fees Payment Upon Application:\s*RM\s*[\d,]+/gi)||[]))];
 return `<section class="study-content" id="fee-answer"><h2>Fee summary for international students</h2>${rs.length?'<ul>'+rs.map(r=>`<li>${esc(r.level)} — ${esc(r.label)}: ${esc(r.text)}</li>`).join('')+'</ul>':'<p>Use the course-specific fee periods and currency labels in the tables below; a comparable RM range by level is not established.</p>'}${initial.map(t=>`<p>One-off initial fees — ${esc(t)}. Read the separate component and payment notes in the schedule below.</p>`).join('')}<p>Fee schedule last checked: not recorded.</p>${(source?.sources||[]).map(s=>`<p><a href="${esc(s.path||s.url)}">${esc(s.label)}</a></p>`).join('')}${docs(uni).map(d=>`<p><a href="${esc(d.href)}" download>Stored fee schedule (${esc(d.type)})</a></p>`).join('')}</section>`;
}
function description(id,uni){
 const levels=[...new Set(ranges(uni).map(r=>r.level.match(/foundation|diploma|bachelor|master|doctor|ph\.?d/i)?.[0].toLowerCase().replace('doctor','PhD')))].join(', ');
 const notes=plain(uni.categories.map(c=>[c.initial_fees,c.other_fees,c.notes,c.remarks].filter(Boolean).join(' ')).join(' '));
 return `${uni.title}: ${levels?levels+' fees':'course fees'}. ${ranges(uni).length?'RM amounts':'Published currencies'}${/initial fees/i.test(notes)?'; initial fees listed':''}. Last checked: not recorded.`;
}
function captions(html){
 return html.replace(/<table\b[^>]*>(?!\s*<caption)/gi,(tag,offset)=>{
  const before=html.slice(0,offset),category=[...before.matchAll(/<button\b[^>]*class="accordion"[^>]*>([\s\S]*?)<\/button>/gi)].at(-1)?.[1];
  return tag+`<caption>${esc(plain(category||'Course fees'))} — amounts and payment periods as labelled.</caption>`;
 });
}
module.exports={ranges,summary,description,captions};
