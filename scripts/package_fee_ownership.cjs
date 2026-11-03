'use strict';
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),out=path.join(root,'docs/fee-ownership-2026-11-02');
const git=args=>cp.execFileSync('git',['-c','core.autocrlf=false',...args],{cwd:root,encoding:'utf8',maxBuffer:32*1024*1024,stdio:['ignore','pipe','pipe']});
const tracked=git(['diff','--name-only']).trim().split(/\r?\n/).filter(Boolean);
const added=['data/fee_page_ownership.json','data/legacy_redirect_routes.json','scripts/fee_page_ownership.cjs','scripts/fee_owner.cjs','scripts/build_fee_ownership_routing.cjs','scripts/audit_fee_pages.cjs','scripts/report_fee_ownership.cjs','scripts/package_fee_ownership.cjs','scripts/prepare_fee_apache_fixture.py','tests/fee_ownership_http_test.py','tests/fee_ownership_test.cjs','tests/fee_ownership_browser_test.cjs','malaysia-university-fees.html','docs/fee-ownership-2026-11-02/apache-local.conf','docs/fee-ownership-2026-11-02/preserved-inputs.json'];
let patch=git(['diff','--no-ext-diff','--binary']);
for(const f of added){const text=fs.readFileSync(path.join(root,f),'utf8').replace(/\r\n/g,'\n');const lines=text.trimEnd().split('\n');patch+=`diff --git a/${f} b/${f}\nnew file mode 100644\n--- /dev/null\n+++ b/${f}\n@@ -0,0 +1,${lines.length} @@\n`+lines.map(l=>'+'+l+'\n').join('');}
fs.writeFileSync(path.join(out,'changes.patch'),patch);
fs.writeFileSync(path.join(out,'patch-files.json'),JSON.stringify([...tracked,...added],null,2)+'\n');
const owners=require('../data/fee_page_ownership.json').universities;
const runtime=[...new Set([...tracked.filter(f=>(f==='.htaccess'||f==='sitemap.xml'||f.endsWith('.html'))&&!f.startsWith('data/')), 'malaysia-university-fees.html','assets/css/company-pages.css'])]
 .filter(f=>!f.startsWith('Fees_Chart/')||owners[path.basename(f,'-fees.html')]?.owner==='fee');
const files=runtime.sort().map(f=>{const bytes=fs.readFileSync(path.join(root,f));return {path:f,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length};});
fs.writeFileSync(path.join(out,'release-manifest.json'),JSON.stringify({domain:'www.onestepmy.com',status:'local-only; not deployed',note:'Reconcile against live files; deploy routing and selected page content together. Excludes CSV exports, analytics ownership ledger, build/test files and archived templates.',files},null,2)+'\n');
console.log(`Prepared ${tracked.length+added.length} source patch files and ${files.length} public runtime files. No upload.`);
