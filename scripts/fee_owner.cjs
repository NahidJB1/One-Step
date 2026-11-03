'use strict';
const ownership=require('../data/fee_page_ownership.json').universities;
const {coursesFromChart}=require('./university_course_cards');
const H=require('./seo_helpers');
const owner=id=>{if(!ownership[id])throw Error('Unknown fee owner: '+id);return ownership[id];};
const href=id=>owner(id).ownerPath;
// Summaries never combine periods, currencies, faculty/campus categories or levels.
// A range is omitted when the existing table cannot establish all those labels.
function summary(chart){
 const groups=new Map();
 for(const c of coursesFromChart(chart)){
  if(!/foundation|diploma|bachelor|master|doctoral|ph\.?d/i.test(c.category)||!c.feeLabel||!/RM|MYR|USD/i.test(c.feeLabel))continue;
  const m=c.fee?.match(/^(MYR|USD)\s+([\d,]+(?:\.\d+)?)$/);if(!m)continue;
  const key=c.category+'|'+c.feeLabel+'|'+m[1];if(!groups.has(key))groups.set(key,{category:c.category,label:c.feeLabel,currency:m[1],values:[]});groups.get(key).values.push(Number(m[2].replaceAll(',','')));
 }
 if(!groups.size)return '<p>Fee ranges by qualification level are not shown here because the existing schedule does not provide a comparable labelled range. Use the full fee chart for course-specific amounts and payment periods.</p>';
 return '<ul>'+[...groups.values()].map(g=>{const min=Math.min(...g.values),max=Math.max(...g.values);const format=n=>n.toLocaleString('en-US',{maximumFractionDigits:2});return `<li>${H.esc(g.category)} — ${H.esc(g.label)}: ${g.currency} ${format(min)}${max!==min?'–'+format(max):''}</li>`;}).join('')+'</ul><p>These ranges cover only the labelled rows in the stored schedule. Other charges, conditions and intake validity remain in the full chart.</p>';
}
module.exports={ownership,owner,href,summary};
