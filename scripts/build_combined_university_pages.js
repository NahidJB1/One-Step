'use strict';

const fs = require('node:fs');
const path = require('node:path');
const {renderCourses} = require('./university_course_cards');
const {accommodation, renderAccommodation} = require('./university_accommodation');
const feeOwner = require('./fee_owner.cjs');
const feeAnswer = require('./fee_answer.cjs');
const feeData = require('../data/fees_data.json');
const feeSources = require('./university_seo_content');

const root = path.resolve(__dirname, '..');
const checkOnly = process.argv.includes('--check');
const configs = {
  bac: {name:'BAC Education Group', short:'BAC', logo:'bac/bac-logo.png', hero:'bac/bac_main.jpg'},
  alfa: {name:'ALFA University College', short:'ALFA', logo:'alfa/alfa-logo.png', hero:'alfa/alfa_main.jpg'},
  inti: {name:'INTI International University', short:'INTI', logo:'inti/inti-logo.png', hero:'inti/inti_main.jpg'},
  klust: {name:'KL University of Science & Technology', short:'KLUST', logo:'klust/klust-logo.png', hero:'klust/klust-main.webp'},
  cityu: {name:'City University Malaysia', short:'CityU', logo:'cityu/cityu-logo.png', hero:'cityu/cityu_main.jpg'},
  cyberjaya: {name:'University of Cyberjaya', short:'UoC', logo:'cyberjaya/University-of-Cyberjaya-logo.png', hero:'cyberjaya/cyberjaya_main.jpg'},
  genovasi: {name:'Genovasi University College', short:'Genovasi', logo:'genovasi/genovasi-logo.png', hero:'genovasi/genovasi-main.jpg'},
  segi: {name:'SEGi University Malaysia', short:'SEGi', logo:'segi/segi-logo.png', hero:'segi/segi_main.jpg'},
  kings: {name:'Kings University College', short:'Kings', logo:'kings/kings-logo.png', hero:'kings/kings-main.jpg'},
  taylors: {name:"Taylor's University", short:"Taylor's", logo:'taylors/taylors-logo.png', hero:'taylors/taylors-main.jpg'},
  unirazak: {name:'Universiti Tun Abdul Razak', short:'UNIRAZAK', logo:'unirazak/unirazak-logo.png.png', hero:'unirazak/unirazak-main.jpg'},
  amu: {name:'Asia Metropolitan University', short:'AMU', logo:'amu/amu_logo.png', hero:'amu/amu_gallery_3.png'},
  apu: {name:'Asia Pacific University of Technology & Innovation', short:'APU', logo:'apu/apu-logo.png', hero:'apu/APU-campus.jpg'},
  help: {name:'HELP University', short:'HELP', logo:'help/help_logo.webp', hero:'help/help_campus_1.jpg'},
  icms: {name:'International College of Management and Sports', short:'ICMS', logo:'icms/icms_logo.webp', hero:'icms/icms_Campus.jfif'},
  limkokwing: {name:'Limkokwing University of Creative Technology', short:'Limkokwing', logo:'limkokwing/Limkokwing_logo.jpg', hero:'limkokwing/limkokwing_campus_1.jpg'},
  lincoln: {name:'Lincoln University College', short:'LUC', logo:'lincoln/lincoln_logo.jfif', hero:'lincoln/lincoln_campus_1.jpg'},
  mmu: {name:'Multimedia University', short:'MMU', logo:'mmu/mmu_logo.png', hero:'mmu/mmu_campus_1.webp'},
  ucsi: {name:'UCSI University', short:'UCSI', logo:'ucsi/ucsi_logo.png', hero:'ucsi/ucsi_campus_1.jpg'},
  unikl: {name:'Universiti Kuala Lumpur', short:'UniKL', logo:'unikl/unikl_logo.png', hero:'unikl/unikl_campus_1.jfif'},
  umw: {name:'International University of Malaya-Wales', short:'IUMW', logo:'umw/umw_logo.png', hero:'umw/umw_campus_1.avif'},
  iium: {name:'International Islamic University Malaysia', short:'IIUM', logo:'iium/iium_logo.png', hero:'iium/iium_campus_1.webp'},
  uow: {name:'University of Wollongong Malaysia', short:'UOW', logo:'uow/UoW_logo.png', hero:'uow/uow_campus_1.jpg'},
  upm: {name:'Universiti Putra Malaysia', short:'UPM', logo:'upm/upm_logo.png', hero:'upm/upm_campus_sky_view.jfif'},
  utem: {name:'Universiti Teknikal Malaysia Melaka', short:'UTeM', logo:'utem/UTEM_logo.png', hero:'utem/utem_sky_view.jpeg'},
  utm: {name:'Universiti Teknologi Malaysia', short:'UTM', logo:'utm/UTM_logo.png', hero:'utm/utm_campus.webp'}
};

// Search titles use the commonly recognized name while the on-page identity stays unchanged.
const seoNames = {
  bac:'BAC Education Group', alfa:'ALFA University College', inti:'INTI', klust:'KLUST',
  cityu:'City University Malaysia', cyberjaya:'University of Cyberjaya', segi:'SEGi',
  genovasi:'Genovasi University College',
  kings:'Kings University College', taylors:"Taylor's University", unirazak:'UNIRAZAK',
  amu:'Asia Metropolitan University', apu:'APU', help:'HELP University', icms:'ICMS',
  limkokwing:'Limkokwing University', lincoln:'Lincoln University College', mmu:'MMU',
  ucsi:'UCSI University', unikl:'UniKL', umw:'IUMW', iium:'IIUM', uow:'UOW Malaysia',
  upm:'UPM', utem:'UTeM', utm:'UTM'
};

const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const articles = JSON.parse(read('data/university_articles.json'));
const researchFaqIds = {
  'Multimedia University (MMU)':'mmu',
  'UCSI University':'ucsi',
  "Taylor's University":'taylors',
  'Asia Pacific University of Technology & Innovation (APU)':'apu',
  'City University Malaysia':'cityu',
  'University of Cyberjaya':'cyberjaya',
  'SEGi University':'segi',
  'Limkokwing University of Creative Technology':'limkokwing',
  'KL University of Science & Technology (KLUST)':'klust',
  'INTI International University':'inti',
  'Universiti Kuala Lumpur (UniKL)':'unikl',
  'HELP University':'help',
  'International University of Malaya-Wales (IUMW)':'umw',
  'Universiti Teknologi Malaysia (UTM)':'utm',
  'Universiti Teknikal Malaysia Melaka (UTeM)':'utem'
};
function researchFaqs() {
  const markdown = read('docs/youruni-faq-research.md');
  const output = {};
  let id = null;
  for (const line of markdown.split(/\r?\n/)) {
    if (line.startsWith('## ')) id = researchFaqIds[line.slice(3).trim()] || null;
    const match = line.match(/^- \*\*(.+?)\*\*\s+(.+)$/);
    if (id && match) (output[id] ||= []).push({question:match[1], answer:match[2]});
  }
  return output;
}
const researchedFaqs = researchFaqs();
const esc = value => String(value).replace(/[&<>\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const plain = html => html.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&#0*39;|&#x0*27;|&apos;/gi, "'").replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
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
  if (start < 0 || end < 0) {
    try { return `<div id="dynamicFeesContainer" class="authored-fee-chart">${balancedElement(fee, 'class="panel"')}</div>`; }
    catch { throw new Error(`Unable to isolate authored fee chart: ${id}`); }
  }
  return `<div id="dynamicFeesContainer" class="authored-fee-chart">${fee.slice(start, end)}</div>`;
}
function detailsFrom(markup) {
  return [...markup.matchAll(/<details\b[\s\S]*?<\/details>/gi)].map(m => m[0]);
}
function faqIntent(question) {
  const text = plain(question).toLowerCase();
  if (/ranking|ranked|qs world|qs asia/.test(text)) return 'ranking';
  if (/where (?:is|are)|located|location/.test(text)) return 'location';
  if (/accredit|recognis|recogniz/.test(text)) return 'accreditation';
  if (/intake|registration date|programme start|program start/.test(text)) return 'intakes';
  if (/ielts|toefl|english (?:score|language|requirement)/.test(text)) return 'english';
  if (/documents? (?:are )?(?:required|requested)|registration documents/.test(text)) return 'documents';
  if (/on-campus accommodation/.test(text)) return 'on-campus-accommodation';
  if (/off-campus (?:accommodation|housing)/.test(text)) return 'off-campus-accommodation';
  return '';
}
function expandResearchAnswer(question, answer, cfg) {
  let copy = answer
    .replace(/^The (?:source )?page says /, `${cfg.short} is described as `)
    .replace(/^The source says /, `${cfg.short} is described as `)
    .replace(/^It gives /, 'The listed requirement is ')
    .replace(/^It lists /, 'The listed information includes ')
    .replace(/^The FAQ gives /, 'The listed address is ');
  const guidance = {
    accreditation:'Accreditation applies to the individual qualification, so confirm the exact programme in the Malaysian Qualifications Register and on the current offer letter.',
    intakes:'Intakes and application deadlines can differ by programme and campus; confirm the current dates before arranging travel or a visa application.',
    english:'English requirements can be higher for particular programmes or professional fields, and the university must confirm which tests and score editions it accepts.',
    documents:'The university may also request certified academic records, translations, English-language evidence or additional visa documents after reviewing the application.',
    'on-campus-accommodation':'A room is not guaranteed until it is confirmed in writing, so check availability, room type, rent, deposit and included utilities for the intended intake.',
    'off-campus-accommodation':'Compare the tenancy term, deposit, utilities, travel time and transport before committing to a private room.',
    location:'Use the campus stated on the offer letter because teaching locations and available programmes can differ.',
    ranking:'Rankings change by edition and subject, so compare the named table and year rather than treating one position as a permanent university-wide result.'
  };
  return `${copy} ${guidance[faqIntent(question)] || 'Confirm the current programme-specific details with the university before applying.'}`;
}
function faqParts(detail, fee) {
  const blocks = [
    between(detail, '<!-- seo:study-guide:start -->', '<!-- seo:study-guide:end -->'),
    between(detail, '<!-- rankings:content:start -->', '<!-- rankings:content:end -->')
  ];
  const seen = new Set();
  return blocks.flatMap(detailsFrom).filter(item => {
    const summary = plain((item.match(/<summary>([\s\S]*?)<\/summary>/i) || [,''])[1]).toLowerCase();
    if (!summary || /^(view ranking sources|programme examples in the stored fee schedule)$/.test(summary.toLowerCase()) || seen.has(summary)) return false;
    seen.add(summary); return true;
  });
}
function mergedFaqParts(id, cfg, detail, fee) {
  const existing = faqParts(detail, fee);
  const intents = new Set(existing.map(item => faqIntent((item.match(/<summary>([\s\S]*?)<\/summary>/i) || [,''])[1])).filter(Boolean));
  const exact = new Set(existing.map(item => plain((item.match(/<summary>([\s\S]*?)<\/summary>/i) || [,''])[1]).toLowerCase()));
  const semanticDedupes = new Set(['ranking','location']);
  const added = (researchedFaqs[id] || []).filter(item => {
    if (/(?:does not give|gives no) dates|supplies no answer|does not provide a location answer|mismatched source answer/i.test(item.answer)) return false;
    const normalized = plain(item.question).toLowerCase();
    const intent = faqIntent(item.question);
    if (exact.has(normalized) || (semanticDedupes.has(intent) && intents.has(intent))) return false;
    exact.add(normalized);
    if (intent) intents.add(intent);
    return true;
  }).map(item => `<details class="editorial-faq"><summary>${esc(item.question)}</summary><p>${esc(expandResearchAnswer(item.question,item.answer,cfg))}</p></details>`);
  return [...existing, ...added];
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
  section = section.replace(/<h2 id="ranking-faqs">[\s\S]*$/i, '</section>');
  return section.replace(/<section class="container university-rankings"/, '<section class="university-rankings"');
}
function studyCopy(data, cfg) {
  const copy = data.detail_intro || `Compare ${cfg.name} courses, campuses, fees and entry requirements for your intended intake.`;
  return `<p>${esc(copy)}</p>`;
}
function renderArticle(id, cfg) {
  const article = articles[id];
  if (!article) return '';
  if (article.images.length < 2 || article.images.length !== article.captions.length) throw new Error(`Incomplete article images: ${id}`);
  const figures = article.images.map((file, index) => {
    const imagePath = `assets/images/universities/${file}`;
    if (!fs.existsSync(path.join(root, imagePath))) throw new Error(`Missing article image: ${imagePath}`);
    const caption = article.captions[index];
    return `<figure class="article-photo"><img src="/${esc(imagePath)}" alt="${esc(cfg.name)}: ${esc(caption)}" loading="lazy" decoding="async"><figcaption>${esc(caption)}</figcaption></figure>`;
  }).join('');
  const photoClass = article.images.length === 2 ? 'article-photo-grid article-photo-grid--two' : 'article-photo-grid';
  return `<section class="combined-shell article-tab" id="articles" hidden aria-labelledby="article-title"><article class="combined-section university-article"><div class="article-heading"><p class="article-kicker">University perspective <span aria-hidden="true">/</span> ${esc(cfg.short)}</p><h2 id="article-title">${esc(article.title)}</h2><p class="article-dek">${esc(article.dek)}</p></div><div class="${photoClass}">${figures}</div><div class="article-body">${article.paragraphs.map(paragraph => `<p>${esc(paragraph)}</p>`).join('')}</div></article></section>`;
}
function documentFor(id, cfg, detail, fee, data) {
  const canonical = `https://www.onestepmy.com/Universities/${id}-university`;
  const faqs = mergedFaqParts(id, cfg, detail, fee);
  const schema = {'@context':'https://schema.org','@graph':[
    {'@type':'CollegeOrUniversity','@id':canonical+'#university',name:cfg.name,url:canonical},
    {'@type':'BreadcrumbList',itemListElement:[]}
  ]};
  schema['@graph'][1] = {'@type':'BreadcrumbList',itemListElement:[
    {'@type':'ListItem',position:1,name:'Home',item:'https://www.onestepmy.com/'},
    {'@type':'ListItem',position:2,name:'Universities',item:'https://www.onestepmy.com/explore-universities'},
    {'@type':'ListItem',position:3,name:cfg.name,item:canonical}
  ]};
  // Visible FAQs remain without FAQ structured data.
  const ownsFees = feeOwner.owner(id).owner==='hub';
  const title = `${cfg.name} | Courses, Fees, Rankings and Admission`;
  const descriptionName = cfg.name;
  const description = ownsFees ? `Explore ${descriptionName} tuition fees for international students, with course fee tables, payment periods, source notes and university information.` : `Explore ${descriptionName} programmes, rankings, campus information and links to its full tuition fee chart for international students.`;
  const feeLink=`<a href="${feeOwner.href(id)}${ownsFees?'#courses-fees':''}">See the full ${esc(cfg.name)} fee chart</a>`;
  const feeNavigation=`<p><a href="#overview">${esc(cfg.name)} university overview</a> · <a href="/compare">Compare universities</a> · <a href="/Articles/cheapest-universities">Compare Malaysia university costs</a></p>`;
  const feeContent=fee;
  const breadcrumbs=`<nav class="study-breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a> <span aria-hidden="true">/</span> <a href="/explore-universities">Universities</a> <span aria-hidden="true">/</span> <a href="${canonical}#overview">${esc(cfg.name)}</a>${ownsFees?' <span aria-hidden="true">/</span> <a href="#courses-fees">Fees</a>':''}</nav>`;
  if(ownsFees)schema['@graph'][1].itemListElement.push({'@type':'ListItem',position:4,name:'Fees',item:canonical+'#courses-fees'});
  return `<!DOCTYPE html>
<html lang="en"><head>
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1776812546531019" crossorigin="anonymous"></script>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="icon" type="image/svg+xml" href="../favicon.svg">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
<link rel="stylesheet" href="../assets/css/index.css"><link rel="stylesheet" href="../assets/css/fees.css"><link rel="stylesheet" href="../assets/css/university-details.css"><link rel="stylesheet" href="../assets/css/study-content.css"><link rel="stylesheet" href="../assets/css/combined-university.css?v=20261103-merged-fees"><link rel="stylesheet" href="/assets/css/mobile.css"><!-- seo:support-style:start -->
<link rel="stylesheet" href="/assets/css/student-support.css">
<!-- seo:support-style:end -->
<noscript><style>.panel{display:block!important}#courses[hidden],#articles[hidden]{display:block!important}</style></noscript>
<title>${esc(title)}</title><meta name="description" content="${esc(description)}"><link rel="canonical" href="${canonical}">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:type" content="website"><meta property="og:url" content="${canonical}">
<script type="application/ld+json">${JSON.stringify(schema)}</script></head>
<body class="combined-university-page" data-university="${id}"><div id="global-nav-placeholder"></div>
<main>
<header class="combined-hero" style="--hero-image:url('/assets/images/universities/${cfg.hero}')"><div class="combined-hero-overlay"></div><div class="combined-hero-content"><div class="combined-hero-identity"><img class="combined-logo" src="../assets/images/universities/${cfg.logo}" alt="${esc(cfg.name)} logo"><span class="combined-eyebrow">University guide <span aria-hidden="true">/</span> Malaysia</span></div><h1>${esc(cfg.name)}</h1><p class="combined-hero-lead">Explore ${esc(cfg.name)} courses, fees, rankings and admission guidance. </p><div class="combined-hero-actions"><a class="combined-primary" href="/apply?university=${id}">Apply now <span aria-hidden="true">↗</span></a><a class="combined-secondary" href="#courses">Explore courses <span aria-hidden="true">→</span></a></div></div><span class="combined-hero-caption">${esc(cfg.short)} <span aria-hidden="true">·</span> Study in Malaysia</span></header>
<div class="combined-tabs-wrap"><nav class="combined-tabs" aria-label="University sections"><a class="active" href="#overview">Overview</a><a href="#courses" aria-controls="courses">Courses</a>${articles[id] ? '<a href="#articles" aria-controls="articles">Articles</a>' : '<span aria-disabled="true">Articles</span>'}${accommodation[id] ? '<a href="#accommodation" aria-controls="accommodation">Accommodation</a>' : '<span aria-disabled="true">Accommodation</span>'}</nav><button class="combined-tabs-more" type="button" aria-label="Show more university sections" hidden>More <span aria-hidden="true">→</span></button></div>
<div class="combined-shell" id="overview">
${breadcrumbs}
<section class="combined-section about-section"><div class="section-heading"><p>University overview</p><h2>About ${esc(cfg.name)}</h2></div><div class="about-copy">${firstAbout(detail)}</div>${gallery(detail)}</section>
<section class="combined-section international-section"><div class="section-heading"><p>International students</p><h2>Study at ${esc(cfg.name)} as an international student</h2></div>${studyCopy(data,cfg)}</section>
<section class="combined-section fees-section" id="courses-fees"><div class="section-heading"><p>Programmes and tuition</p><h2>${esc(cfg.name)} courses and fees for International students</h2></div>${feeContent}${feeNavigation}</section>
<!-- rankings:content:start -->${ranking(detail)}<!-- rankings:content:end -->
<section class="combined-section campus-gallery"><div class="section-heading"><p>Explore the campus</p><h2>Campus gallery</h2></div>${gallery(detail)}</section>
<section class="combined-section combined-faq" id="faq"><div class="section-heading"><p>Questions and answers</p><h2>Frequently Asked Questions About ${esc(cfg.name)}</h2></div>${faqs.join('\n')}</section>
</div>${renderCourses(id,cfg.name,feeChart(fee,id),{showFees:ownsFees,feeHref:feeOwner.href(id)})}${renderArticle(id,cfg)}${renderAccommodation(id,cfg.name)}</main><div id="lightbox" class="lightbox"><span class="close-lightbox">&times;</span><img id="lightbox-img" alt="Campus image preview"></div><!-- seo:student-support:start -->
<aside class="support-inline"><h2>Support after you arrive in Malaysia</h2><p>Need help with airport pickup, a room, your clinic visit or university registration? Plan the next steps with One-Step.</p><a href="/student-support-malaysia">Explore student support and arrival arrangements &#8594;</a></aside>
<!-- seo:student-support:end -->
<div id="global-footer-placeholder"></div>
<script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script><script src="../assets/js/footer.js"></script><script src="../assets/js/navbar.js"></script><script src="../assets/js/fees.js"></script><script src="../assets/js/combined-university.js?v=20261016-accommodation-photos-1"></script></body></html>\n`;
}

const editorial = JSON.parse(read('data/university_seo_content.json'));
let outdated = 0;
for (const [id,cfg] of Object.entries(configs)) {
  let detail = read(`data/university_details/${id}-details.html`);
  const fee = read(`data/university_fees/${id}.html`);
  for (const mergedId of Object.keys(configs)) {
    detail = detail.replaceAll(`/Universities/${mergedId}-details`, `/Universities/${mergedId}-university`)
      .replaceAll(`/Fees_Chart/${mergedId}-fees#`, `${feeOwner.href(mergedId)}#`)
      .replaceAll(`/Fees_Chart/${mergedId}-fees`, feeOwner.href(mergedId));
  }
  let output = documentFor(id,cfg,detail,fee,editorial[id] || {});
  if (id === 'alfa') output = output.replaceAll('Alfa University College', cfg.name);
  const file = path.join(root, 'Universities', `${id}-university.html`);
  if (!fs.existsSync(file) || fs.readFileSync(file,'utf8') !== output) {
    outdated++;
    if (!checkOnly) fs.writeFileSync(file, output);
  }
}
if (checkOnly && outdated) { console.error(`${outdated} combined university page(s) are outdated.`); process.exit(1); }
console.log(checkOnly ? 'Combined university pages are current.' : `Built ${Object.keys(configs).length} combined university pages.`);
