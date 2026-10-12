'use strict';
// Offline build: no AI/API, browser, server or dependency is needed on Hostinger.
// Run after scripts/build_university_rankings.php. --check never writes files.
const H = require('./seo_helpers');
const prioritySEO = require('./university_seo_content');
const {fs,path,root,origin,read,esc,plain,rich,jsonScript,urlFor,replaceElement,block,metadata,breadcrumbs,breadcrumbHtml,stylesheet,documentLink} = H;
const fees = JSON.parse(read('data/fees_data.json'));
const rankings = JSON.parse(read('data/university_rankings.json'));
const check = process.argv.includes('--check');
// A scoped build preserves unrelated authored work while using the same renderer.
const scopeArg = process.argv.find(arg => arg.startsWith('--universities='));
const scopeIds = scopeArg ? scopeArg.slice('--universities='.length).split(',').filter(Boolean) : null;
if (scopeIds && (!scopeIds.length || scopeIds.some(id => !rankings.universities[id]?.page))) throw new Error('Unknown or empty university build scope');
const scopeFiles = scopeIds ? new Set(scopeIds.flatMap(id => [`Fees_Chart/${id}-fees.html`, `Universities/${id}-details.html`])) : null;
const changed = [];
const rendered = new Map();
const slug = id => id === 'city-university' ? 'cityu' : id;
const feeId = id => id === 'cityu' ? 'city-university' : id;
const short = id => rankings.universities[id]?.short_name || fees[feeId(id)]?.title || id;
const feeFile = id => `Fees_Chart/${id}-fees.html`;
const detailFile = id => `Universities/${id}-details.html`;
function save(file, html) {
    if (file.endsWith('.html')) html = html.replace(/(href="[^"\n]*\/Fees_Chart\/)city-university-fees(?=[".?#])/g,'$1cityu-fees');
    html = html.replace(/\r\n/g, '\n').trimEnd() + '\n';
    rendered.set(file, html);
}
function sourceDocs(uni) {
    const docs = new Map();
    for (const raw of [uni.file_link, ...uni.categories.map(c => c.pdf_link)]) {
        const doc = documentLink(raw);
        if (doc) docs.set(doc.href,doc);
    }
    return [...docs.values()];
}
function renderTables(uni, id) {
    const tables = uni.categories.map((cat,index) => {
        const table = cat.table;
        let html = `<h2 class="fee-category-title"><button type="button" class="accordion" aria-expanded="false" aria-controls="fee-category-${index}">${esc(plain(cat.category_name) || 'Programs and fees')}</button></h2>\n<div class="panel" id="fee-category-${index}">`;
        html += prioritySEO.feeSourceLabel(id, index, uni);
        if (table?.rows?.length) {
            html += `<div class="table-responsive"><table aria-label="${esc(plain(cat.category_name) || 'Programs and fees')}">`;
            if (table.headers?.length) html += '<thead><tr>' + table.headers.map(v=>`<th scope="col">${rich(v)}</th>`).join('') + '</tr></thead>';
            html += '<tbody>' + table.rows.map(row => '<tr>' + row.map(cell => `<td>${rich(cell)}</td>`).join('') + '</tr>').join('\n') + '</tbody></table></div>';
        }
        const notes = [['Initial fees',cat.initial_fees],['Other fees',cat.other_fees],['Notes',cat.notes],['Schedule remarks',cat.remarks]].filter(([,v])=>v);
        if (notes.length) html += '<div class="fee-source-note">' + notes.map(([label,text])=>`<p><strong>${label}:</strong><br>${rich(text)}</p>`).join('') + '</div>';
        const doc = documentLink(cat.pdf_link);
        if (doc) html += `<p class="fee-source-links"><a href="${doc.href}" download>Download ${esc(plain(cat.category_name) || 'fee schedule')} (${doc.type})</a></p>`;
        return html + '</div>';
    }).join('\n');
    const doc = sourceDocs(uni)[0];
    return tables + (doc ? `\n<a class="resources-card" href="${doc.href}" download><div class="resources-icon"><i class="fas ${doc.type === 'ZIP' ? 'fa-file-archive' : 'fa-file-pdf'}" aria-hidden="true"></i></div><div class="resources-content"><h3>Download fee schedule (${doc.type})</h3><p>Stored fee document for ${esc(uni.title)}. Check the printed validity and terms.</p></div><div class="resources-action"><i class="fas fa-download" aria-hidden="true"></i></div></a>` : '');
}
function feeFaqs(id, uni) {
    const name = short(id);
    const headers = [...new Set(uni.categories.flatMap(c=>c.table?.headers || []).map(plain))];
    const periods = headers.filter(h=>/semester|\bsem\b|year|total|tuition/i.test(h) && !/^no|duration|total semester/i.test(h)).slice(0,7);
    const faqs = [
        {q:`What are ${name}'s tuition fees for international students?`, a:`Find your program and campus in the fee chart on this page, then read the relevant student category, fee columns and remarks. ${periods.length ? 'The schedule uses labels including ' + periods.join(', ') + '. ' : ''}Different programs and fee periods cannot be combined into one reliable tuition price. Amounts not shown need an intake-specific quotation.`},
        {q:`What are ${name}'s tuition fees for Bangladeshi students?`, a:`Bangladeshi applicants should check the international-student rate for their program and intake. This page does not establish a separate Bangladesh-only tuition rate or guarantee eligibility for a discount. Check nationality-specific charges, deposits, visa costs and scholarship conditions in the schedule and your written offer.`},
        {q:`Does the ${name} fee chart show fees per semester or per year?`, a:`Use the exact period printed in each column. A first-year payment, fee per semester and full-program total describe different costs. Where a semester or annual breakdown is absent, request a payment schedule; dividing a program total can give the wrong instalment amount.`},
        {q:`Where can I find the official ${name} fee chart?`, a:`${sourceDocs(uni).length ? 'The download links on this page open the stored fee documents. ' : ''}One-Step is a student guidance website. Confirm the document's edition, campus, student category and validity with the university before accepting an offer or paying. The university's current written fee schedule and offer determine the amount payable.`},
        {q:`Which year do the ${name} fees apply to?`, a:uni.validity ? `The supplied schedule states: ${plain(uni.validity)}. Check individual course notes and confirm that the same rates apply to your intake.` : `Use any effective dates and intake restrictions stated in the fee documents and course remarks. A single validity year has not been confirmed for every table on this page. A recent page update does not mean all underlying fees are for the current year.`},
        {q:`Does ${name} offer scholarships for international students?`, a:`Check any scholarship, adjusted tuition or discount columns alongside their conditions. A listed reduction is not an automatic award for every international or Bangladeshi applicant. Ask for the scholarship name, eligibility, application deadline, renewal conditions and final payable fee in writing.`}
    ];
    return prioritySEO.content[id] ? [...prioritySEO.content[id].fee_faqs, faqs[1], ...faqs.slice(3)] : faqs;
}
for (const [key,uni] of Object.entries(fees)) {
    const id = slug(key), file = feeFile(id), name = short(id);
    let html = read(file);
    // These three pages already contain authored tables; retain their additional
    // rows and payment notes instead of replacing them with incomplete JSON.
    const dynamic = /<div\b[^>]*id="dynamicFeesContainer"/.test(html);
    if (dynamic) html = replaceElement(html, /<div\b[^>]*id="dynamicFeesContainer"[^>]*>/, `<div id="dynamicFeesContainer" data-source="fees_data.json">\n${renderTables(uni, id)}\n</div>`);
    html = html.replace(/<body\b([^>]*)>/, (m,attrs)=>`<body${attrs.replace(/\sdata-fees-prerendered(?:="[^"]*")?/g,'')} data-fees-prerendered="true">`);
    if (!html.includes('data-custom-header')) {
        html = replaceElement(html, /<div class="header-text">/, `<div class="header-text"><h1>${esc(uni.title)} tuition fees</h1><h2 class="fee-header-subtitle">Fee chart for international students</h2>${uni.validity ? `<p>${esc(uni.validity)}</p>` : ''}</div>`);
        if (uni.logo) html = replaceElement(html, /<div class="logo-container">/, `<div class="logo-container"><img src="${esc(uni.logo)}" alt="${esc(name)} logo" class="static-logo" width="100" height="100"></div>`);
        const theme = uni.theme?.theme_color ? uni.theme : {theme_color:'#0B1B3D',theme_dark:'#050D20',theme_accent:'#FFD700',theme_light:'#F0F5FF'};
        html = block(html,'fee-theme',`<style>:root {${Object.entries(theme).filter(([k,v])=>/^theme_(color|dark|accent|light)$/.test(k) && /^#[\da-f]{3,8}$/i.test(v)).map(([k,v])=>`--${k.replace('_','-')}:${v};`).join('')}}</style>`);
    }
    // The old copy was hidden and mixed unrelated fee periods into false ranges.
    html = replaceElement(html, /<section\b[^>]*id="seo-content"[^>]*>/, '', false);
    html = replaceElement(html, /<div\b[^>]*id="static-faq"[^>]*>/, '', false);
    html = replaceElement(html, /<div\b[^>]*class="popular-queries-section"[^>]*>/, '', false);
    html = replaceElement(html, /<nav\b[^>]*class="breadcrumb"[^>]*>/, '', false);
    const crumbs = [['Home','index.html'],['Universities','explore-universities.html'],[name,detailFile(id)],['Tuition fees',file]];
    const categories = [...new Set(uni.categories.map(c=>plain(c.category_name)).filter(Boolean))];
    const overview = `${breadcrumbHtml(crumbs)}<section class="study-content" id="fees-guide" aria-labelledby="fees-guide-title">
<h2 id="fees-guide-title">${esc(name)} tuition fees for international students</h2>
<p>Check course costs, payment periods and additional charges before applying from Bangladesh or another country. Select your program and campus, then read its fee headings and notes together.</p>
<details class="study-faq"><summary>How to read this fee chart</summary>${categories.length ? `<p><strong>Covered in the schedule:</strong> ${esc(categories.slice(0,8).join('; '))}${categories.length > 8 ? '; and further faculty or campus sections below' : ''}.</p>` : ''}<p>Amounts retain their published labels. First-year payments, semester fees, tuition-only amounts and program totals may include different items. Scholarships and nationality-specific costs need confirmation for your intake.</p></details>
<p><a href="/${detailFile(id).replace('.html','')}#rankings">${esc(name)} QS World, Asia and Malaysia rankings</a> · <a href="/Articles/scholarships-for-international-students-malaysia">International student scholarship guide</a> · <a href="#faq">Fee questions and answers</a></p>
</section>`;
    html = block(html, 'fee-guide', prioritySEO.content[id] ? prioritySEO.feeGuide(id, uni, crumbs, html) : overview, '<div class="search-container">');
    const docs = sourceDocs(uni);
    const faq = feeFaqs(id, uni);
    const faqHtml = `<section id="faq" class="study-content" aria-labelledby="fee-faq-title"><h2 id="fee-faq-title">${esc(name)} fee chart: questions and answers</h2>${faq.map(f=>`<details class="study-faq"><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('\n')}${docs.length ? `<h3>Fee documents</h3><p>Check the date and terms printed in each stored schedule. Confirm current rates with the university.</p><div class="fee-source-links">${docs.map((d,i)=>`<a href="${d.href}" download>Download fee schedule${docs.length>1 ? ' '+(i+1) : ''} (${d.type})</a>`).join('')}</div>` : ''}</section>`;
    html = block(html, 'fee-faq', faqHtml, '<div id="global-footer-placeholder">');
    if (prioritySEO.content[id]) html = prioritySEO.feePage(html, id);
    // Make existing resource cards usable by keyboard and crawlers as well.
    const resource = /<div\b[^>]*class="resources-card"[^>]*onclick="downloadPDF\('([^']+)'\)"[^>]*>/;
    const match = resource.exec(html);
    if (match) {
        const doc = documentLink(match[1]);
        if (doc) {
            const range = H.elementRange(html,resource), card = html.slice(...range);
            html = html.slice(0,range[0]) + card.replace(resource, `<a class="resources-card" href="${doc.href}" download>`).replace(/<\/div>$/, '</a>').replace('Download Official PDF','Download fee schedule (PDF)').replace(/<p>[\s\S]*?<\/p>/,`<p>Stored fee schedule for ${esc(name)}; check the document's validity.</p>`) + html.slice(range[1]);
        }
    }
    const years = [...new Set((uni.validity || '').match(/\b20\d{2}\b/g) || [])];
    const edition = years.length === 1 ? ' '+years[0] : '';
    const title = prioritySEO.content[id]?.fee_title || `${name} Tuition Fees${edition} & International Fee Chart | One-Step`;
    const description = prioritySEO.content[id]?.fee_description || `Explore ${name} tuition fees for international and Bangladeshi students. Compare course costs, payment periods, fee documents and scholarship conditions.`;
    html = metadata(html, file, title, description, [
        {'@type':'WebPage','@id':urlFor(file)+'#webpage',url:urlFor(file),name:title,description,about:{'@id':urlFor(detailFile(id))+'#university'}},
        breadcrumbs(crumbs), {'@type':'FAQPage','@id':urlFor(file)+'#faq',mainEntity:faq.map(f=>({'@type':'Question',name:f.q,acceptedAnswer:{'@type':'Answer',text:f.a}}))}
    ]);
    save(file, stylesheet(html));
}

const directoryItems = Object.keys(rankings.universities).filter(id=>rankings.universities[id].page).sort((a,b)=>short(a).localeCompare(short(b)));
function directory() {
    return '<ul class="study-directory">' + directoryItems.map(id=>`<li><a href="/${detailFile(id).replace('.html','')}">${esc(rankings.universities[id].name)}</a><small><a href="/${feeFile(id).replace('.html','')}">Tuition fees and fee chart</a> · <a href="/${detailFile(id).replace('.html','')}#rankings">QS rankings</a></small></li>`).join('\n') + '</ul>';
}
for (const id of directoryItems) {
    const file = detailFile(id), uni = fees[feeId(id)], name = short(id);
    let html = read(file);
    // Keep these fields aligned with the ranking builder without touching its
    // ranking facts or FAQ schema. This build can also run on machines without PHP.
    const record = rankings.universities[id];
    const display = metric => metric.status === 'ranked' ? '#'+metric.rank.replace(/-/g,'–') : ({not_listed:'Not listed',contributor:'QS Contributor (no rank)',unverified:'Not verified'}[metric.status]);
    const title = prioritySEO.content[id]?.detail_title || name + ' Malaysia: Courses, Fees & QS Rankings | One-Step';
    const rankingEsc = value => esc(value).replace(/&#39;/g,'&#039;');
    const description = prioritySEO.content[id]?.detail_description || (record.world.scope === 'parent'
        ? `UOW Malaysia rankings explained: the Australian parent university is ${display(record.world)} in QS World ${record.world.year}. Check campus scope, Malaysia listing status and ranking FAQs.`
        : `${name} ranking: QS World ${rankings.editions.world} ${display(record.world)}, QS Asia ${rankings.editions.asia} ${display(record.asia)}. Explore courses, tuition fee charts, scholarship guidance and campus details.`);
    html = html.replace(/<title>[^<]*<\/title>/,`<title>${rankingEsc(title)}</title>`)
        .replace(/<meta name="description" content="[^"]*">/,`<meta name="description" content="${rankingEsc(description)}">`)
        .replace(/<meta property="og:title" content="[^"]*">/,`<meta property="og:title" content="${rankingEsc(title)}">`)
        .replace(/<meta property="og:description" content="[^"]*">/,`<meta property="og:description" content="${rankingEsc(description)}">`);
    const crumbs = [['Home','index.html'],['Universities','explore-universities.html'],[name,file]];
    html = block(html,'study-guide',`<section class="container study-content" id="fees-and-scholarships">
${breadcrumbHtml(crumbs)}
<h2>${esc(name)} tuition fees, scholarships and study planning</h2>
<p>Planning to study at ${esc(rankings.universities[id].name)}? Compare the <a href="/${feeFile(id).replace('.html','')}">${esc(name)} tuition fees and fee chart</a> with the campus, course and ranking information on this page. The chart keeps the published payment periods and additional-fee notes alongside the programs.</p>
<h3>Tuition fees for international and Bangladeshi students</h3>
<p>Select your course, campus and international-student category before comparing costs. Use an annual or semester amount only when the schedule labels it that way. Bangladeshi applicants should also confirm nationality-related charges and whether any tuition reduction applies to their offer.</p>
<h3>${esc(name)} scholarships for international students</h3>
<p>${uni.categories.some(c=>/scholarship|adjusted|discount/i.test(JSON.stringify(c))) ? 'The stored fee information includes scholarship, discount or adjusted-fee wording. Read the applicable course notes before treating a reduction as available to you.' : 'This page does not confirm an active scholarship award or deadline for every course and intake.'} Ask for written eligibility, award value, renewal conditions and the final payable fees. Our <a href="/Articles/scholarships-for-international-students-malaysia">Malaysia scholarship guide</a> explains what to check before applying.</p>
<p><a href="#rankings">View ${esc(name)} QS global, Asia and Malaysia rankings</a> · <a href="/Articles/top-10-universities-in-malaysia">Compare 10 covered universities and QS ranks</a> · <a href="/Articles/cheapest-universities">Compare affordable university fees</a></p>
</section>`, '<!-- rankings:content:start -->');
    if (prioritySEO.content[id]) {
        html = block(html,'study-guide',prioritySEO.detailGuide(id,uni,crumbs));
        html = prioritySEO.detailPage(html,id);
    }
    html = block(html,'breadcrumbs',jsonScript({'@context':'https://schema.org', ...breadcrumbs(crumbs)},'study-breadcrumb-schema'));
    html = stylesheet(html);
    // The PHP ranking builder appends its owned metadata last in the head.
    // Keep that order and its entity spelling so sequential builds stay stable.
    const owned = /[ \t]*<!-- rankings:seo:start -->[\s\S]*?<!-- rankings:seo:end -->\s*/;
    const rankingBlock = html.match(owned)?.[0].trimEnd();
    if (rankingBlock) html = html.replace(owned,'').replace(/\s*<\/head>/,'\n'+rankingBlock+'\n</head>');
    html = html.replace(/^<!-- rankings:content:start -->/m,'  <!-- rankings:content:start -->');
    save(file, html);
}
for (const file of ['index.html','explore-universities.html']) {
    let html = read(file);
    html = html.replace('10 Cheapest Universities in Malaysia','10 Affordable Universities in Malaysia');
    const content = file === 'index.html'
        ? `<section class="container study-content"><h2>Malaysia university fees and rankings</h2><p>Browse course fee charts, university profiles and dated QS rankings for international students, including applicants from Bangladesh.</p><details><summary>Browse all ${directoryItems.length} university guides and fee charts</summary>${directory()}</details><p><a href="/articles">Student guides: costs, scholarships and university comparisons</a></p></section>`
        : `<section class="container study-content"><h2>University tuition fees and ranking directory</h2><p>Find each university's fee chart, campus information and QS ranking sources. Read scholarship and payment conditions before comparing offers.</p>${directory()}</section>`;
    html = block(html,'directory',content,'<div id="global-footer-placeholder">');
    if (file === 'explore-universities.html') html = html.replace('<h2 class="section-title">Featured <span>Universities</span></h2>','<h1 class="section-title">Featured <span>Universities</span></h1>');
    const title = file === 'index.html' ? 'Study in Malaysia: University Fees, Rankings & Guides | One-Step' : 'Malaysian Universities: Tuition Fees & QS Rankings | One-Step';
    const description = 'Compare Malaysian university tuition fees, course details, QS rankings and scholarship guidance for international students, including applicants from Bangladesh.';
    const schema = file === 'index.html'
        ? {'@type':'WebSite',url:urlFor(file),name:'One-Step',alternateName:'One Step MY',description}
        : {'@type':'CollectionPage',url:urlFor(file),name:title,description};
    html = metadata(html,file,title,description,[schema]);
    save(file,stylesheet(html,''));
}

// Article generation is separate to keep the fee renderer independent of editorial
// choices. Both use the same local fact sources and exact fee labels.
require('./seo_articles')({H, fees, rankings, short, feeId, feeFile, detailFile, save, rendered});

save('contact.html', metadata(read('contact.html'),'contact.html','Contact One-Step: Malaysia University Study Guidance','Contact One-Step about Malaysian university courses, tuition fee schedules, application assistance and scholarship conditions.',[{'@type':'ContactPage',url:urlFor('contact.html'),name:'Contact One-Step'},breadcrumbs([['Home','index.html'],['Contact','contact.html']])]));

require('./student_support')({H,save,rendered});

// Public content only. The previous sitemap omitted every article and hub page.
const rootPages = ['index.html','explore-universities.html','articles.html','student-support-malaysia.html','compare.html','contact.html','scholarship-options.html','scholarship.html','malaysia-scholarship.html'];
const pages = [...rootPages, ...['Universities','Fees_Chart','Articles','countries'].flatMap(dir=>fs.readdirSync(path.join(root,dir)).filter(f=>f.endsWith('.html')).map(f=>`${dir}/${f}`))];
// Omit lastmod until per-page source/editorial dates can be maintained accurately.
// File copy times and the build date are not evidence that a fee was reviewed.
const sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + [...new Set(pages)].filter(file=>rendered.has(file) || fs.existsSync(path.join(root,file))).map(file=>`  <url><loc>${esc(urlFor(file))}</loc></url>`).join('\n') + '\n</urlset>\n';
save('sitemap.xml',sitemap);
// Compare only final output: shared sections may enrich a page after its renderer.
for (const [file, html] of rendered) {
    if (scopeFiles && !scopeFiles.has(file)) continue;
    if (fs.existsSync(path.join(root,file)) && read(file) === html) continue;
    changed.push(file);
    if (!check) fs.writeFileSync(path.join(root,file),html);
}
console.log(`${check ? 'Outdated' : 'Updated'} SEO files: ${changed.length}`);
if (changed.length) console.log(changed.join('\n'));
if (check && changed.length) process.exitCode = 1;
