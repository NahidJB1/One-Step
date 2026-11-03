'use strict';
const fs = require('node:fs');
const assert = require('node:assert/strict');
const htaccess = fs.readFileSync('.htaccess', 'utf8');
const rules = [...htaccess.matchAll(/^RewriteRule (\S+) (https:\/\/www\.onestepmy\.com\S*) \[R=301,L,QSD\]$/gm)].map(([,pattern,target])=>({pattern:new RegExp(pattern),target}));
assert.equal(rules.length, 56, 'Retain the historical alias inventory');
assert(htaccess.includes('RewriteRule \\.php(?:/|$) - [END,NC]'),'PHP endpoints are excluded');
assert(htaccess.includes('api|assets|'),'API and assets are excluded');
const audit = JSON.parse(fs.readFileSync('docs/seo/coverage-audit-2026-09-23.json','utf8'));
let matched=0;
for (const row of audit.results) {
  const url=new URL(row.url);
  const rule=rules.find(r=>r.pattern.test(decodeURIComponent(url.pathname.slice(1))));
  if (!rule) continue;
  const destination=rule.target;
  assert(!rules.some(r=>r.pattern.test(new URL(destination).pathname.slice(1))),`Direct destination cannot itself be an alias: ${row.url}`);
  matched++;
}
for (const {target} of rules) {
  const path=new URL(target).pathname;
  const file=path==='/'?'index.html':path.slice(1)+(path.endsWith('.php')?'':'.html');
  assert(fs.existsSync(file),`Redirect target exists: ${file}`);
}
assert(matched>=40,'Cover the historical URL variants from the Search Console exports');
console.log(`Redirect checks passed: ${rules.length} mappings; ${matched} reported URL variants. Static rule checks; production deployment still requires HTTP verification.`);
