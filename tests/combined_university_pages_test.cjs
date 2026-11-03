'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const feeOwner = require('../scripts/fee_owner.cjs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const ids = ['bac', 'alfa', 'inti', 'klust', 'cityu', 'cyberjaya', 'genovasi', 'segi', 'kings', 'taylors', 'unirazak', 'amu', 'apu', 'help', 'icms', 'limkokwing', 'lincoln', 'mmu', 'ucsi', 'unikl', 'umw', 'iium', 'uow', 'upm', 'utem', 'utm'];
const articles = JSON.parse(fs.readFileSync(path.join(root, 'data/university_articles.json'), 'utf8'));
const researchedFaqIds = ['mmu','ucsi','taylors','apu','cityu','cyberjaya','segi','limkokwing','klust','inti','unikl','help','umw','utm','utem'];
const seoTitles = new Set();
const seoDescriptions = new Set();
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const plain = html => html.replace(/<[^>]+>/g, ' ').replace(/&(?:nbsp|amp);/g, ' ').replace(/\s+/g, ' ').trim();
const tables = html => [...html.matchAll(/<table\b[\s\S]*?<\/table>/gi)].map(match => plain(match[0]));
const summaries = html => [...html.matchAll(/<summary>([\s\S]*?)<\/summary>/gi)].map(match => plain(match[1])).filter(Boolean);
const marked = (html, start, end) => {
  const from = html.indexOf(start);
  const to = html.indexOf(end, from + start.length);
  assert.ok(from >= 0 && to >= 0, `missing source markers: ${start}`);
  return html.slice(from + start.length, to);
};

execFileSync(process.execPath, ['scripts/build_combined_university_pages.js', '--check'], { cwd: root, stdio: 'pipe' });

for (const id of ids) {
  const canonicalizeName = text => id === 'alfa' ? text.replaceAll('Alfa University College', 'ALFA University College') : text;
  const sourceDetail = canonicalizeName(read(`data/university_details/${id}-details.html`));
  const sourceFees = canonicalizeName(read(`data/university_fees/${id}.html`));
  const combined = read(`Universities/${id}-university.html`);
  const combinedFaq = (combined.match(/<section class="combined-section combined-faq"[\s\S]*?<\/section>/i) || [''])[0];

  const title = combined.match(/<title>([^<]+)<\/title>/)?.[1];
  const description = combined.match(/<meta name="description" content="([^"]+)">/)?.[1];
  const ownsFees=feeOwner.owner(id).owner==='hub';
  assert.match(title || '', /Courses, Fees, Rankings and Admission/);
  assert.match(description || '', /international students[,.]/);
  assert.equal(combined.match(/<meta property="og:title" content="([^"]+)">/)?.[1], title, `${id}: social title differs`);
  assert.equal(combined.match(/<meta property="og:description" content="([^"]+)">/)?.[1], description, `${id}: social description differs`);
  assert(!description.includes('living costs'), `${id}: metadata should describe its assigned intent`);
  seoTitles.add(title);
  seoDescriptions.add(description);

  assert.match(combined, new RegExp(`<link rel="canonical" href="https://www\\.onestepmy\\.com/Universities/${id}-university">`));
  for (const section of ['overview', 'courses-fees', 'rankings', 'faq']) {
    assert.ok(combined.includes(`id="${section}"`), `${id}: missing #${section}`);
  }
  assert.ok(combined.includes(`/apply?university=${id}`), `${id}: missing reserved Apply route`);
  assert.ok(combined.includes('Campus gallery'), `${id}: missing campus gallery`);
  if (articles[id]) {
    assert.ok(combined.includes('href="#articles"'), `${id}: Articles tab is missing`);
    assert.ok(combined.includes(`id="articles"`), `${id}: article section is missing`);
    assert.ok(combined.includes(articles[id].title.replaceAll('&', '&amp;')), `${id}: article title is missing`);
    for (const image of articles[id].images) assert.ok(combined.includes(`/assets/images/universities/${image}`), `${id}: article image is missing`);
  } else {
    assert.ok(!combined.includes('href="#articles"'), `${id}: empty Articles tab is clickable`);
  }

  const feeTables = tables(sourceFees);
  assert.ok(feeTables.length > 0, `${id}: source fee page has no tables`);
  const combinedText = plain(combined);
  for (const table of feeTables) {
    if(ownsFees)assert.ok(combinedText.includes(table), `${id}: a source fee table changed or disappeared`);
  }
  if(!ownsFees){assert(!combined.includes('<table'),`${id}: overview contains full tables`);assert(combined.includes(`href="${feeOwner.href(id)}"`),`${id}: fee owner link missing`);}

  const expectedFaqs = new Set([
    ...summaries(marked(sourceDetail, '<!-- seo:study-guide:start -->', '<!-- seo:study-guide:end -->')),
    ...summaries(marked(sourceDetail, '<!-- rankings:content:start -->', '<!-- rankings:content:end -->'))
  ]);
  for (const question of expectedFaqs) {
    if (/^(View ranking sources|Programme examples in the stored fee schedule)$/.test(question)) continue;
    assert.ok(combinedText.includes(question), `${id}: missing FAQ: ${question}`);
  }
  assert.ok(!summaries(combinedFaq).some(question => /^(View ranking sources|Programme examples in the stored fee schedule)$/.test(question)), `${id}: non-question content remains in FAQ`);
  assert.equal(new Set(summaries(combinedFaq).map(question => question.toLowerCase())).size, summaries(combinedFaq).length, `${id}: duplicate FAQ question`);
  if (researchedFaqIds.includes(id)) {
    for (const fragment of ['degrees accredited', 'registration documents', 'on-campus accommodation']) {
      assert.ok(summaries(combinedFaq).some(question => question.toLowerCase().includes(fragment)), `${id}: researched FAQ missing: ${fragment}`);
    }
  }

  const rankingBlock = marked(sourceDetail, '<!-- rankings:content:start -->', '<!-- rankings:content:end -->');
  const rankingGrid = rankingBlock.match(/<dl class="ranking-grid">([\s\S]*?)<\/dl>/i);
  assert.ok(rankingGrid, `${id}: expected World, Asia and Malaysia ranking grid`);
  assert.ok(combinedText.includes(plain(rankingGrid[0])), `${id}: ranking values changed or disappeared`);
}
assert.equal(seoTitles.size, ids.length, 'University titles should be unique');
assert.equal(seoDescriptions.size, ids.length, 'University descriptions should be unique');
const sitemap = read('sitemap.xml');
const redirectRules = [...read('.htaccess').matchAll(/^RewriteRule (\S+) (https:\/\/www\.onestepmy\.com\/\S+) \[R=301,L,QSD\]$/gm)]
  .map(([,pattern,target]) => ({pattern:new RegExp(pattern),target}));
for (const id of ids) {
  for (const legacy of [`Universities/${id}-details`, `Fees_Chart/${id}-fees`]) {
    if(legacy.startsWith('Fees_Chart/')&&feeOwner.owner(id).owner==='fee'){assert(!redirectRules.some(r=>r.pattern.test(legacy)),`${id}: fee owner must not redirect`);continue;}
    for (const suffix of ['', '.html']) {
      const rule = redirectRules.find(rule => rule.pattern.test(legacy + suffix));
      assert.equal(rule?.target, `https://www.onestepmy.com/Universities/${id}-university`, `${legacy}${suffix}: direct permanent redirect missing`);
    }
  }
  assert.ok(sitemap.includes(`/Universities/${id}-university</loc>`), `${id}: new URL missing from sitemap`);
  assert.ok(!sitemap.includes(`/Universities/${id}-details</loc>`), `${id}: legacy detail URL remains in sitemap`);
  assert.equal(sitemap.includes(`/Fees_Chart/${id}-fees</loc>`),feeOwner.owner(id).owner==='fee',`${id}: fee sitemap ownership mismatch`);
}

console.log(`Validated ${ids.length} combined university pages with preserved fee tables, rankings and FAQs.`);
