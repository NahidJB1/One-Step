'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const hashes=require('../data/university_fees/table_hashes.json');
let count=0;
for(const [id,expected] of Object.entries(hashes)){
 const html=fs.readFileSync(`Universities/${id}-university.html`,'utf8');
 const section=html.split('id="courses-fees"')[1].split('<!-- rankings:content:start -->')[0];
 const actual=[...section.matchAll(/<table\b[\s\S]*?<\/table>/gi)].map(m=>crypto.createHash('sha256').update(m[0]).digest('hex'));
 assert.deepEqual(actual,expected,`${id}: exact source table markup changed`);
 assert(section.includes('id="searchInput"'),`${id}: missing search`);
 assert(!fs.existsSync(`Fees_Chart/${id}-fees.html`),`${id}: separate page returned`);
 assert(!/<a[^>]+Fees_Chart/.test(html),`${id}: old fee link`);
 assert(!/<header[\s\S]*?See the full[\s\S]*?<\/header>/.test(html),`${id}: hero fee link`);
 const source=fs.readFileSync(`data/university_fees/${id}.html`,'utf8');
 for(const [,href] of source.matchAll(/href="([^"]+)"[^>]*download/g)){assert(section.includes(`href="${href}"`));assert(fs.existsSync('.'+href),`${id}: missing document`);}
 count+=actual.length;
}
console.log(`Preserved exact markup of ${count} tables across ${Object.keys(hashes).length} universities; search, document links and removed pages checked.`);
