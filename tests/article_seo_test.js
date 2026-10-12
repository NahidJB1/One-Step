'use strict';
const assert=require('node:assert/strict');
const H=require('../scripts/seo_helpers');
const guides=require('../scripts/student_guides')({H,fees:JSON.parse(H.read('data/fees_data.json')),rankings:JSON.parse(H.read('data/university_rankings.json'))});
let checks=0;
function check(value,message){assert(value,message);checks++;}
const titles=new Set(),descriptions=new Set();
const hub=H.read('articles.html'),sitemap=H.read('sitemap.xml');
for(const [file,d] of Object.entries(guides.pages)){
  const html=H.read(file),url=H.urlFor(file);
  const title=html.match(/<title>(.*?)<\/title>/)[1];
  const description=html.match(/<meta name="description" content="([^"]*)"/)[1];
  check(!titles.has(title),'Unique title: '+file);titles.add(title);
  check(!descriptions.has(description),'Unique description: '+file);descriptions.add(description);
  check((html.match(/rel="canonical"/g)||[]).length===1 && html.includes('rel="canonical" href="'+url+'"'),'Self canonical: '+file);
  check(!/noindex|nofollow/i.test(html),'Indexable article: '+file);
  check(sitemap.includes('<loc>'+url+'</loc>'),'Sitemap membership: '+file);
  check(hub.includes('href="/'+file.replace('.html','')+'"'),'Static hub link: '+file);
  const graphs=[...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].flatMap(m=>JSON.parse(m[1])['@graph']||[]);
  const article=graphs.find(g=>g['@type']==='Article');
  check(article?.headline===d.title && article.mainEntityOfPage===url,'Schema identifies visible article: '+file);
  check(article.citation.length>0 && article.wordCount>200,'Source and article metadata: '+file);
  check(article.isPartOf.url===H.urlFor('articles.html'),'Hub relationship: '+file);
  check(graphs.some(g=>g['@type']==='BreadcrumbList'),'Breadcrumb schema: '+file);
  check(H.fs.existsSync(H.path.join(H.root,new URL(article.image).pathname)),'Schema image exists: '+file);
  check(html.includes('name="twitter:title"') && html.includes('max-image-preview:large'),'Preview metadata: '+file);
}
const hubGraph=JSON.parse(hub.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
const collection=hubGraph.find(g=>g['@type']==='CollectionPage');
check(collection.mainEntity.numberOfItems===12,'Hub schema contains twelve guides');
check(new Set(collection.mainEntity.itemListElement.map(i=>i.url)).size===12,'Hub list has unique URLs');
console.log('Article SEO checks passed: '+checks);
