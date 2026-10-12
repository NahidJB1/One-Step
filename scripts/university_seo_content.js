'use strict';
// Editorial intent and source links for the ten priority institutions.
// Fee cells remain owned by fees_data.json (or the authored Cyberjaya chart).
const content = require('../data/university_seo_content.json');
const H = require('./seo_helpers');
const {esc, plain, block, breadcrumbHtml, replaceElement} = H;
const combinedIds = new Set(['bac', 'alfa', 'inti', 'klust', 'cityu', 'cyberjaya', 'segi', 'kings', 'taylors', 'unirazak', 'amu', 'apu', 'help', 'icms', 'limkokwing', 'lincoln', 'mmu', 'ucsi', 'unikl', 'umw', 'iium', 'uow', 'upm', 'utem', 'utm']);
const feePath = id => combinedIds.has(id) ? `/Universities/${id}-university#courses-fees` : `/Fees_Chart/${id}-fees`;
const feeCategoryPath = (id, category) => combinedIds.has(id) ? `/Universities/${id}-university#fee-category-${category}` : `/Fees_Chart/${id}-fees#fee-category-${category}`;
const detailPath = id => combinedIds.has(id) ? `/Universities/${id}-university` : `/Universities/${id}-details`;
const links = items => `<ul class="study-link-list">${items.map(item => `<li><a href="${esc(item.path || item.url)}">${esc(item.label)}</a></li>`).join('')}</ul>`;
const faq = items => items.map(f => `<details class="study-faq"><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('\n');

function feeSourceLabel(id, index, uni) {
    const c = content[id];
    if (!c?.fee_provenance) return '';
    const source = c.fee_provenance;
    const section = source.sections?.[index] || {};
    return `<details class="study-faq fee-provenance"><summary>Schedule source and validity</summary>
<p><strong>Institution/campus in the stored schedule:</strong> ${esc(section.institution || c.name)}.<br><strong>Section:</strong> ${esc(plain(uni.categories[index].category_name))}.<br><strong>Student category:</strong> International students.<br><strong>Schedule edition:</strong> ${esc(section.edition || source.edition)}.<br><strong>Fee basis:</strong> ${esc(section.basis || source.basis)}.</p>
${section.status ? `<p>${esc(section.status)}</p>` : ''}
${links(section.sources || source.sources)}
</details>`;
}

function feeGuide(id, uni, crumbs, html) {
    const c = content[id];
    const labels = [...html.matchAll(/<button\b[^>]*class="accordion"[^>]*>([\s\S]*?)<\/button>/g)].map(m => plain(m[1]));
    return `${breadcrumbHtml(crumbs)}<section class="study-content university-intent" id="fees-guide" aria-labelledby="fees-guide-title">
<p class="study-eyebrow">International tuition &amp; programme costs</p>
<h2 id="fees-guide-title">Plan your ${esc(c.name)} study budget</h2>
<p>${esc(c.scope)}</p>
${c.fee_provenance ? `<p class="fee-source-note">${esc(c.fee_provenance.status)}</p>` : ''}
<nav class="study-actions" aria-label="Fee page sections"><a href="#fee-tables">Browse fee chart</a><a href="#payment-planning">Initial payments &amp; other costs</a><a href="#faq">Fee questions &amp; documents</a></nav>
<details class="study-faq"><summary>Choose a programme or campus section</summary><ul class="study-section-links">${labels.map((label,i) => `<li><a href="#fee-category-${i}">${esc(label)}</a></li>`).join('')}</ul></details>
<p class="study-counterpart">Choosing a course or intake? <a href="${detailPath(id)}${c.verified_programmes ? '#courses-intakes' : ''}">Explore ${esc(c.name)} courses, campuses and admissions guidance</a>.</p>
</section>`;
}

function feePlanning(id) {
    const c = content[id];
    return `<section class="study-content university-intent" id="payment-planning" aria-labelledby="payment-planning-title">
<h2 id="payment-planning-title">Understand your ${esc(c.name)} fee breakdown</h2>
<div class="study-planning-grid"><div><h3>Tuition and payment periods</h3><p>${esc(c.fee_reading)}</p></div><div><h3>Initial payments and additional charges</h3><p>${esc(c.payment)}</p></div></div>
<h3>Budgeting from Bangladesh</h3><p>Use the currency and payment period printed in your programme's schedule. Keep accommodation, travel and living expenses separate from tuition. A BDT estimate needs a dated exchange rate and may differ from the amount your bank charges.</p>
<p>Compare scholarship or adjusted-fee columns only after your eligibility is confirmed. Your written offer should identify the award, covered charges and renewal conditions.</p>
${links([{label:'Scholarship eligibility and conditions',path:detailPath(id)+'#scholarships'},{label:'Malaysia living-cost guide',path:'/Articles/cost-of-living-malaysia-international-students'},{label:'Student visa process and cost stages',path:'/Articles/visas-and-requirements-malaysia'}])}
<p><a class="study-primary-link" href="/contact">Ask about my programme's fee schedule</a></p>
</section>`;
}

function feePage(html, id) {
    const c = content[id];
    html = html.replace(/<body\b([^>]*)>/, (m,attrs) => `<body${attrs.replace(/\sdata-university-guide="[^"]*"/g,'')} data-university-guide="${id}">`);
    // Preserve custom header logos, source validity wording and authored tables.
    html = replaceElement(html, /<h1\b[^>]*>/, `<h1>${esc(c.name)} tuition fees</h1>`);
    let index = 0;
    html = html.replace(/<div\b([^>]*\bclass="panel"[^>]*)>/g, (m, attrs) => `<div${attrs.replace(/\s+id="[^"]*"/g, '')} id="fee-category-${index++}">`);
    index = 0;
    html = html.replace(/<button\b([^>]*\bclass="accordion"[^>]*)>/g, (m, attrs) => `<button${attrs.replace(/\s+aria-controls="[^"]*"/g, '')} aria-controls="fee-category-${index++}">`);
    html = block(html,'fee-table-anchor','<div id="fee-tables" class="study-anchor" aria-hidden="true"></div>','<div class="search-container">');
    return block(html,'fee-planning',feePlanning(id),'<!-- seo:fee-faq:start -->');
}

function detailIntro(id) {
    const c = content[id];
    return `<section class="container study-content university-intent study-decision" aria-labelledby="study-decision-title">
<p class="study-eyebrow">University guide for Bangladeshi applicants</p>
<h2 id="study-decision-title">Study at ${esc(c.name)}</h2><p>${esc(c.detail_intro)}</p>
<nav class="study-actions" aria-label="University guide sections"><a href="#courses-intakes">Courses &amp; intakes</a><a href="#bangladesh-entry">Entry planning</a><a href="#rankings">Ranking evidence</a><a href="${feePath(id)}">International fee chart</a></nav>
</section>`;
}

function courseExamples(id, uni) {
    const verified = content[id].verified_programmes;
    if (verified) {
        const c = content[id];
        return `<h3>${esc(c.programme_heading)}</h3><p>${esc(c.programme_note)}</p>
<p>On a small screen, scroll the table horizontally to view every column.</p><div class="table-responsive" tabindex="0" role="region" aria-label="Verified programme references"><table style="min-width:760px"><caption>Selected official programme references; checked ${esc(c.programme_checked)}</caption><thead><tr><th scope="col">Qualification</th><th scope="col">Institution and location</th><th scope="col">Study information</th><th scope="col">Official evidence</th><th scope="col">Fee section</th></tr></thead><tbody>${verified.map(p=>`<tr><th scope="row">${esc(p.programme)}</th><td>${esc(p.institution)}<br>${esc(p.location)}</td><td>${esc(p.study)}</td><td><a href="${esc(p.source)}">${esc(p.source_label)}</a></td><td><a href="${feeCategoryPath(id,p.fee_category)}">${esc(p.fee_label)}</a></td></tr>`).join('')}</tbody></table></div>`;
    }
    if (id === 'cyberjaya') return ''; // Its authored chart has broader coverage than JSON.
    const examples = [];
    for (const [i,cat] of uni.categories.entries()) {
        const headers = (cat.table?.headers || []).map(plain);
        const nameIndex = headers.findIndex(h => /^program(me)?$/i.test(h));
        const durationIndex = headers.findIndex(h => /duration/i.test(h));
        const intakeIndex = headers.findIndex(h => /^intake$/i.test(h));
        if (nameIndex < 0) continue;
        const row = cat.table.rows.find(r => /bachelor|^ba\b|^bsc\b|^bsc\s*\(|^diploma|^foundation/i.test(plain(r[nameIndex])));
        if (!row) continue;
        examples.push(`<tr><th scope="row">${esc(plain(row[nameIndex]))}</th><td>${esc(plain(cat.category_name))}</td><td>${durationIndex >= 0 ? esc(plain(row[durationIndex])) : 'See programme source'}</td><td>${intakeIndex >= 0 ? esc(plain(row[intakeIndex])) : 'Confirm for this programme'}</td><td><a href="${feeCategoryPath(id,i)}">View relevant fee section</a></td></tr>`);
        if (examples.length === 4) break;
    }
    if (!examples.length) return '';
    return `<details class="study-faq"><summary>Programme examples in the stored fee schedule</summary><p>These examples retain the stored schedule's wording. They are not a complete course catalogue or confirmation of the next open intake. Use the official programme sources below to confirm current availability.</p><div class="table-responsive" tabindex="0" role="region" aria-label="Programme examples"><table><caption>Selected programme examples; schedule information only</caption><thead><tr><th scope="col">Programme</th><th scope="col">Schedule section</th><th scope="col">Duration</th><th scope="col">Intake in schedule</th><th scope="col">Tuition</th></tr></thead><tbody>${examples.join('')}</tbody></table></div></details>`;
}

function detailGuide(id, uni, crumbs) {
    const c = content[id];
    return `<section class="container study-content university-intent" id="fees-and-scholarships">
${breadcrumbHtml(crumbs)}
<h2 id="courses-intakes">${esc(c.name)} courses and intake planning</h2>
<ul>${c.courses.map(text => `<li>${esc(text)}</li>`).join('')}</ul>
${courseExamples(id,uni)}
<h3>Choosing your intake</h3><p>${esc(c.intakes)}</p>
<h3 id="bangladesh-entry">Entry planning for Bangladeshi students</h3><p>${esc(c.bangladesh)}</p>
<p>Prepare your qualification certificates, subject transcripts and any English-test results for assessment. Confirm the exact programme, campus, study mode, academic conditions and international application deadline together. This guide does not establish a universal HSC grade or IELTS waiver.</p>
<p><a href="/Articles/malaysia-student-visa-requirements">Plan the student visa document requirements</a></p>
<h3 id="scholarships">Scholarships and eligibility</h3><p>${id === 'apu' ? 'APU publishes separate international merit-award terms; use the official award source below when checking qualification eligibility and continuation conditions.' : 'A scholarship or adjusted-fee entry in a schedule is not proof that every applicant qualifies. Request the named award, eligible programme and intake, application deadline and continuation requirements.'} Keep the approved award and final fee offer together. <a href="/Articles/scholarships-for-international-students-malaysia">Read the Malaysia scholarship guide</a>.</p>
<h3>Tuition and study budget</h3><p><a href="${feePath(id)}">View ${esc(c.name)} international tuition fees and payment notes</a>. The separate fee chart explains the published payment periods and additional charges for financial planning.</p>
<h3>Questions about studying at ${esc(c.name)}</h3>${faq(c.detail_faqs)}
<h3>Official programme and institution sources</h3>${links(c.sources)}
<h3>Compare your study options</h3>${links(c.related)}
<p><a class="study-primary-link" href="/contact">Discuss my course, campus and intake</a></p>
</section>`;
}

function detailPage(html, id) {
    if (content[id].detail_h1) html = replaceElement(html, /<h1\b[^>]*>/, `<h1>${esc(content[id].detail_h1)}</h1>`);
    html = html.replace(/<body\b([^>]*)>/, (m,attrs) => `<body${attrs.replace(/\sdata-university-guide="[^"]*"/g,'')} data-university-guide="${id}">`);
    html = block(html,'university-decision',detailIntro(id),'<div class="container main-container">');
    // Legacy campus-wide month lists cannot establish every programme's intake.
    html = html.replace(/(<strong>Intakes<\/strong>\s*)<span>[^<]*<\/span>/g,'$1<span><a href="#courses-intakes">Varies by programme; view intake guidance</a></span>');
    html = html.replace(/<strong>Avg Fee \(Bachelor\)<\/strong>\s*<span>[^<]*<\/span>/g,`<strong>Programme costs</strong><span><a href="${feePath(id)}">View international fee chart</a></span>`);
    html = html.replace(/<strong>Visa Approval<\/strong>\s*<span>[^<]*<\/span>/g,'<strong>Student visa</strong><span><a href="/Articles/malaysia-student-visa-requirements">Requirements and documents</a></span>');
    html = html.replace(/<strong>Employment<\/strong>\s*<span>100% for ECE Grads<\/span>/g,'<strong>Career planning</strong><span><a href="#courses-intakes">Explore course pathways</a></span>');
    html = html.replace(' and maintains a 100% graduate employability record','');
    return html;
}

module.exports = {content, feeGuide, feePlanning, feePage, feeSourceLabel, detailGuide, detailPage};
