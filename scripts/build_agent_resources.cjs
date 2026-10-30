'use strict';
// Narrow build: preserve all existing authored and generated university content.
const fs = require('node:fs');
const path = require('node:path');
const H = require('./seo_helpers');
const root = H.root;
const write = (file, text) => fs.writeFileSync(path.join(root,file),text);
let html = H.read('index.html');
html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, H.jsonScript({'@context':'https://schema.org','@graph':require('./agent_schema')('Compare Malaysian university tuition fees, course details, QS rankings and scholarship guidance for international students, including applicants from Bangladesh.')}));
if (!html.includes('assets/js/agent-tools.js')) html = html.replace('</head>','  <link rel="alternate" type="text/markdown" href="/index.md">\n  <link rel="describedby" type="text/plain" href="/llms.txt">\n  <script src="/assets/js/agent-tools.js" defer></script>\n</head>');
write('index.html',html);
for (const [slug,title,body,type] of [
    ['about','About One-Step','<p>One-Step helps students explore study options in Malaysia. Compare universities, courses, tuition fee schedules, scholarship conditions and student guides, including guidance for international applicants from Bangladesh.</p><p>Our site provides study planning and application guidance. Confirm current course requirements, fee periods, scholarship eligibility and visa requirements with the issuing university or authority before making a decision or payment.</p><p><a href="/explore-universities">Explore universities</a> · <a href="/student-support-malaysia">Student support</a></p>','AboutPage'],
    ['terms','Terms of use','<p>Use this website to research and compare study options. Information is guidance and may change. University offers, official fee schedules and the relevant authorities determine admission requirements, fees, scholarship awards and visa decisions.</p><p>Check the course, campus, student category, intake, payment period and exclusions before comparing amounts. A page modification date does not mean that every fee, ranking or requirement has been reviewed on that date.</p><p>Guidance does not guarantee admission, a scholarship or a visa. Contact One-Step to clarify information or report an error. Any application or paid service is subject to the terms provided for that service.</p><p>Automated access preferences are published in <a href="/robots.txt">robots.txt</a>. Agent resources provide public guidance only; they do not submit applications or provide access to accounts.</p>','WebPage']
]) {
    if (fs.existsSync(path.join(root,slug+'.html'))) continue;
    write(slug+'.html',`<!DOCTYPE html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title} | One-Step</title><meta name="description" content="${title}: Malaysian university study guidance, contact details and information use."><link rel="canonical" href="${H.origin}/${slug}"><link rel="icon" href="/favicon.svg"><style>body{font:18px/1.7 system-ui,sans-serif;color:#14243c;margin:0}main{max-width:800px;margin:auto;padding:40px 24px}a{color:#005cb9}nav{margin-bottom:32px}h1{line-height:1.2}</style>${H.jsonScript({'@context':'https://schema.org','@type':type,name:title,url:H.origin+'/'+slug,about:{'@id':H.origin+'/#organization'}})}</head><body><main><nav aria-label="Site"><a href="/">Home</a> · <a href="/about">About</a> · <a href="/contact">Contact</a> · <a href="/terms">Terms</a></nav><h1>${title}</h1>${body}<p><a href="mailto:info@onestepmy.com">info@onestepmy.com</a> · <a href="tel:+601119359497">+60 11 1935 9497</a></p></main></body></html>\n`);
}
let ht = H.read('.htaccess');
if (!ht.includes('# Agent resources')) {
    // Homepage is internally served by PHP after canonical host/path redirects.
    const position = '# Normalize literal repeated slashes';
    ht = ht.replace(position,`# Agent resources: explicit static MIME types and discovery-card CORS.
AddType text/markdown .md
<IfModule mod_headers.c>
  <Files "server-card.json">
    Header set Access-Control-Allow-Origin "*"
  </Files>
</IfModule>

${position}`);
    const rule = 'RewriteRule ^(?:index\\.html)?$ includes/agent-home.php [END]\n\n';
    // Place before extensionless resolution but after all canonical redirects.
    const target = 'RewriteRule ^apply$';
    const offset = ht.indexOf(target);
    if (offset < 0) throw new Error('Homepage routing insertion point missing');
    ht = ht.slice(0,offset) + rule + ht.slice(offset);
    write('.htaccess',ht);
}
let sitemap = H.read('sitemap.xml');
for (const slug of ['about','terms']) if (!sitemap.includes(`<loc>${H.origin}/${slug}</loc>`)) sitemap = sitemap.replace('</urlset>',`  <url><loc>${H.origin}/${slug}</loc></url>\n</urlset>`);
const pages = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([,url])=>new URL(url).pathname).map(p=>p==='/'?'index.html':p.slice(1)+'.html');
const dates = require('./sitemap_lastmod')(root,pages,H.read,write);
sitemap = sitemap.replace(/<url><loc>([^<]+)<\/loc>(?:<lastmod>[^<]+<\/lastmod>)?<\/url>/g,(_,url)=>{const p=new URL(url).pathname; const file=p==='/'?'index.html':p.slice(1)+'.html';return `<url><loc>${url}</loc><lastmod>${dates[file].lastmod}</lastmod></url>`;});
write('sitemap.xml',sitemap);
console.log(`Agent resources updated; ${pages.length} sitemap lastmod dates.`);
