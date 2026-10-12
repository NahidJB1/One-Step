'use strict';
const fs = require('node:fs');
const assert = require('node:assert/strict');
const htaccess = fs.readFileSync('.htaccess', 'utf8');
const block = htaccess.split('# Send known production aliases')[1].split('# Force HTTPS and WWW')[0];
const rules = [...block.matchAll(/^RewriteRule (\S+) (\S+) \[R=301,L\]$/gm)].map(([,pattern,target])=>({pattern:new RegExp(pattern),target}));
assert.equal(rules.length, 28, 'Every historical alias has a direct production redirect');
assert.equal((block.match(/RewriteCond %\{HTTP_HOST\}/g)||[]).length,rules.length,'Direct production redirects are hostname guarded');
const audit = JSON.parse(fs.readFileSync('docs/seo/coverage-audit-2026-09-23.json','utf8'));
let matched=0;
for (const row of audit.results) {
  const url=new URL(row.url);
  const rule=rules.find(r=>r.pattern.test(decodeURIComponent(url.pathname.slice(1))));
  if (!rule) continue;
  const destination=rule.target+url.search;
  assert.equal(destination,row.final,`Direct redirect retains the verified destination: ${row.url}`);
  matched++;
}
for (const {target} of rules) {
  const path=new URL(target).pathname;
  const file=path==='/'?'index.html':path.slice(1)+(path.endsWith('.php')?'':'.html');
  assert(fs.existsSync(file),`Redirect target exists: ${file}`);
}
assert(matched>=40,'Cover the historical URL variants from the Search Console exports');
console.log(`Redirect checks passed: ${rules.length} mappings; ${matched} reported URL variants. Static rule checks; production deployment still requires HTTP verification.`);
