'use strict';

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const checkOnly = process.argv.includes('--check');
const configs = {
  bac: {name:'BAC Education Group', short:'BAC', logo:'bac/bac-logo.png', hero:'bac/bac_main.jpg'},
  alfa: {name:'ALFA University Malaysia', short:'ALFA', logo:'alfa/alfa-logo.png', hero:'alfa/alfa_main.jpg'},
  inti: {name:'INTI International University', short:'INTI', logo:'inti/inti-logo.png', hero:'inti/inti_main.jpg'},
  klust: {name:'KL University of Science & Technology', short:'KLUST', logo:'klust/klust-logo.png', hero:'klust/klust-main.webp'},
  cityu: {name:'City University Malaysia', short:'CityU', logo:'cityu/cityu_main.jpg', hero:'cityu/cityu_main.jpg'},
  cyberjaya: {name:'University of Cyberjaya', short:'UoC', logo:'cyberjaya/University-of-Cyberjaya-logo.png', hero:'cyberjaya/cyberjaya_main.jpg'}
};

const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const esc = value => String(value).replace(/[&<>\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const plain = html => html.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&#39;|&apos;/g, "'").replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
const between = (html, start, end) => {
  const a = html.indexOf(start), b = html.indexOf(end, a + start.length);
  if (a < 0 || b < 0) throw new Error(`Missing marker: ${start} / ${end}`);
  return html.slice(a + start.length, b);
};
function balancedElement(html, marker, tag='div') {
  const markerAt = html.indexOf(marker);
  if (markerAt < 0) throw new Error(`Missing ${marker}`);
  const start = html.lastIndexOf(`<${tag}`, markerAt);
  const token = new RegExp(`<\\/?${tag}\\b[^>]*>`, 'gi');
  token.lastIndex = start;
  let depth = 0, match;
  while ((match = token.exec(html))) {
    depth += match[0][1] === '/' ? -1 : 1;
    if (depth === 0) return html.slice(start, token.lastIndex);
  }
  throw new Error(`Unbalanced ${tag} around ${marker}`);
}
function firstAbout(detail) {
  if (detail.includes('id="overview"')) {
    const overview = balancedElement(detail, 'id="overview"');
    const beforeGallery = overview.split('<div class="gallery-grid">')[0];
    const paragraphs = [...beforeGallery.matchAll(/<p(?:\s[^>]*)?>([\s\S]*?)<\/p>/gi)].map(m => m[0]);
    if (paragraphs.length) return paragraphs.join('\n');
  }
  const match = detail.match(/<h3>Overview &amp; History<\/h3>\s*(<p>[\s\S]*?<\/p>)/i) || detail.match(/<h3>Overview & History<\/h3>\s*(<p>[\s\S]*?<\/p>)/i);
  return match ? match[1] : '<p>Explore the institution, its study options and the published fee information below.</p>';
}
function gallery(detail) {
  try { return balancedElement(detail, 'class="gallery-grid"'); }
  catch { return ''; }
}
function feeChart(fee, id) {
  if (fee.includes('id="dynamicFeesContainer"')) return balancedElement(fee, 'id="dynamicFeesContainer"');
  const start = fee.indexOf('<button class="accordion"');
  const end = fee.indexOf('<div class="view-details-btn-container"', start);
  if (start < 0 || end < 0) throw new Error(`Unable to isolate authored fee chart: ${id}`);
  return `<div id="dynamicFeesContainer" class="authored-fee-chart">${fee.slice(start, end)}</div>`;
}
function detailsFrom(markup) {
  return [...markup.matchAll(/<details\b[\s\S]*?<\/details>/gi)].map(m => m[0]);
}
function faqParts(detail, fee) {
  const blocks = [
    between(detail, '<!-- seo:study-guide:start -->', '<!-- seo:study-guide:end -->'),
    between(detail, '<!-- rankings:content:start -->', '<!-- rankings:content:end -->'),
    between(fee, '<!-- seo:fee-faq:start -->', '<!-- seo:fee-faq:end -->')
  ];
  const seen = new Set();
  return blocks.flatMap(detailsFrom).filter(item => {
    const summary = plain((item.match(/<summary>([\s\S]*?)<\/summary>/i) || [,''])[1]).toLowerCase();
    if (!summary || seen.has(summary)) return false;
    seen.add(summary); return true;
  });
}
function faqSchema(items) {
  return items.map(item => {
    const q = plain((item.match(/<summary>([\s\S]*?)<\/summary>/i) || [,''])[1]);
    const a = plain(item.replace(/^[\s\S]*?<\/summary>/i, '').replace(/<\/details>[\s\S]*$/i, ''));
    return {'@type':'Question', name:q, acceptedAnswer:{'@type':'Answer', text:a}};
  });
}
function ranking(detail) {
  let section = between(detail, '<!-- rankings:content:start -->', '<!-- rankings:content:end -->');
  section = section.replace(/<h2 id="ranking-faqs">[\s\S]*$/i, '');
  return section.replace(/<section class="container university-rankings"/, '<section class="university-rankings"');
}
function studyCopy(data, cfg) {
  const copy = data.detail_intro || `Compare ${cfg.name} courses, campuses, fees and entry requirements for your intended intake.`;
  return `<p>${esc(copy)}</p>`;
}
function documentFor(id, cfg, detail, fee, data) {
  const canonical = `https://www.onestepmy.com/Universities/${id}-university`;
  const faqs = faqParts(detail, fee);
  const schema = {'@context':'https://schema.org','@graph':[
    {'@type':'CollegeOrUniversity','@id':canonical+'#university',name:cfg.name,url:canonical},
    {'@type':'BreadcrumbList',itemListElement:[]}
  ]};
  schema['@graph'][1] = {'@type':'BreadcrumbList',itemListElement:[
    {'@type':'ListItem',position:1,name:'Home',item:'https://www.onestepmy.com/'},
    {'@type':'ListItem',position:2,name:'Universities',item:'https://www.onestepmy.com/explore-universities'},
    {'@type':'ListItem',position:3,name:cfg.name,item:canonical}
  ]};
  schema['@graph'].push({'@type':'FAQPage','@id':canonical+'#faq',mainEntity:faqSchema(faqs)});
  const title = `${cfg.name}: Courses, Fees & Rankings | One-Step`;
  const description = `Explore ${cfg.name} courses and international tuition fees, QS rankings, campus gallery, accommodation information and application guidance.`;
  return `<!DOCTYPE html>
<html lang="en"><head>
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1776812546531019" crossorigin="anonymous"></script>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="icon" type="image/svg+xml" href="../favicon.svg">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
<link rel="stylesheet" href="../assets/css/index.css"><link rel="stylesheet" href="../assets/css/fees.css"><link rel="stylesheet" href="../assets/css/university-details.css"><link rel="stylesheet" href="../assets/css/study-content.css"><link rel="stylesheet" href="../assets/css/combined-university.css"><link rel="stylesheet" href="/assets/css/mobile.css">
<title>${esc(title)}</title><meta name="description" content="${esc(description)}"><link rel="canonical" href="${canonical}">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:type" content="website"><meta property="og:url" content="${canonical}">
<script type="application/ld+json">${JSON.stringify(schema)}</script></head>
<body class="combined-university-page" data-university="${id}"><div id="global-nav-placeholder"></div>
<main>
<header class="combined-hero" style="--hero-image:url('../assets/images/universities/${cfg.hero}')"><div class="combined-hero-overlay"></div><div class="combined-hero-content"><img class="combined-logo" src="../assets/images/universities/${cfg.logo}" alt="${esc(cfg.name)} logo"><div><p class="combined-eyebrow">Study in Malaysia</p><h1>${esc(cfg.name)}</h1><div class="combined-hero-actions"><a class="combined-primary" href="/apply?university=${id}">Apply now</a><a class="combined-secondary" href="/contact">Ask us</a></div></div></div></header>
<nav class="combined-tabs" aria-label="University sections"><a class="active" href="#overview">Overview</a><span aria-disabled="true">Courses <small>Later</small></span><span aria-disabled="true">Articles <small>Later</small></span><span aria-disabled="true">Accommodation <small>Later</small></span></nav>
<div class="combined-shell" id="overview">
<section class="combined-section about-section"><div class="section-heading"><p>University overview</p><h2>About ${esc(cfg.name)}</h2></div><div class="about-copy">${firstAbout(detail)}</div>${gallery(detail)}</section>
<section class="combined-section international-section"><div class="section-heading"><p>International students</p><h2>Study at ${esc(cfg.name)} as an international student</h2></div>${studyCopy(data,cfg)}</section>
<section class="combined-section fees-section" id="courses-fees"><div class="section-heading"><p>Programmes and tuition</p><h2>${esc(cfg.name)} ${esc(cfg.short)} courses and fees for international students</h2></div><div class="search-container"><div class="search-box-wrapper"><input type="text" id="searchInput" placeholder="Search courses and programmes" aria-label="Search courses and programmes"><button type="button" class="search-icon-btn" aria-label="Search fee chart">&#128269;</button></div></div>${feeChart(fee,id)}</section>
<!-- rankings:content:start -->${ranking(detail)}<!-- rankings:content:end -->
<section class="combined-section campus-gallery"><div class="section-heading"><p>Explore the campus</p><h2>Campus gallery</h2></div>${gallery(detail)}</section>
<section class="combined-section combined-faq" id="faq"><div class="section-heading"><p>Questions and answers</p><h2>Frequently Asked Questions About ${esc(cfg.name)} ${esc(cfg.short)}</h2></div>${faqs.join('\n')}</section>
</div></main><div id="lightbox" class="lightbox"><span class="close-lightbox">&times;</span><img id="lightbox-img" alt="Campus image preview"></div><div id="global-footer-placeholder"></div>
<script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script><script src="../assets/js/footer.js"></script><script src="../assets/js/navbar.js"></script><script src="../assets/js/fees.js"></script><script src="../assets/js/combined-university.js"></script><script src="../assets/js/chatbot.js"></script></body></html>\n`;
}

const editorial = JSON.parse(read('data/university_seo_content.json'));
let outdated = 0;
for (const [id,cfg] of Object.entries(configs)) {
  const detail = read(`Universities/${id}-details.html`), fee = read(`Fees_Chart/${id}-fees.html`);
  const output = documentFor(id,cfg,detail,fee,editorial[id] || {});
  const file = path.join(root, 'Universities', `${id}-university.html`);
  if (!fs.existsSync(file) || fs.readFileSync(file,'utf8') !== output) {
    outdated++;
    if (!checkOnly) fs.writeFileSync(file, output);
  }
}
if (checkOnly && outdated) { console.error(`${outdated} combined university page(s) are outdated.`); process.exit(1); }
console.log(checkOnly ? 'Combined university pages are current.' : `Built ${Object.keys(configs).length} combined university pages.`);
