'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const ids = ['bac', 'alfa', 'inti', 'klust', 'cityu', 'cyberjaya'];
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
  const sourceDetail = read(`Universities/${id}-details.html`);
  const sourceFees = read(`Fees_Chart/${id}-fees.html`);
  const combined = read(`Universities/${id}-university.html`);

  assert.match(combined, new RegExp(`<link rel="canonical" href="https://www\\.onestepmy\\.com/Universities/${id}-university">`));
  for (const section of ['overview', 'courses-fees', 'rankings', 'faq']) {
    assert.ok(combined.includes(`id="${section}"`), `${id}: missing #${section}`);
  }
  assert.ok(combined.includes(`/apply?university=${id}`), `${id}: missing reserved Apply route`);
  assert.ok(combined.includes('Campus gallery'), `${id}: missing campus gallery`);

  const feeTables = tables(sourceFees);
  assert.ok(feeTables.length > 0, `${id}: source fee page has no tables`);
  const combinedText = plain(combined);
  for (const table of feeTables) {
    assert.ok(combinedText.includes(table), `${id}: a source fee table changed or disappeared`);
  }

  const expectedFaqs = new Set([
    ...summaries(marked(sourceDetail, '<!-- seo:study-guide:start -->', '<!-- seo:study-guide:end -->')),
    ...summaries(marked(sourceDetail, '<!-- rankings:content:start -->', '<!-- rankings:content:end -->')),
    ...summaries(marked(sourceFees, '<!-- seo:fee-faq:start -->', '<!-- seo:fee-faq:end -->'))
  ]);
  for (const question of expectedFaqs) {
    assert.ok(combinedText.includes(question), `${id}: missing FAQ: ${question}`);
  }

  const rankingBlock = marked(sourceDetail, '<!-- rankings:content:start -->', '<!-- rankings:content:end -->');
  const rankingGrid = rankingBlock.match(/<dl class="ranking-grid">([\s\S]*?)<\/dl>/i);
  assert.ok(rankingGrid, `${id}: expected World, Asia and Malaysia ranking grid`);
  assert.ok(combinedText.includes(plain(rankingGrid[0])), `${id}: ranking values changed or disappeared`);
}

const sitemap = read('sitemap.xml');
for (const id of ids) {
  assert.ok(sitemap.includes(`/Universities/${id}-university</loc>`), `${id}: new URL missing from sitemap`);
  assert.ok(!sitemap.includes(`/Universities/${id}-details</loc>`), `${id}: legacy detail URL remains in sitemap`);
  assert.ok(!sitemap.includes(`/Fees_Chart/${id}-fees</loc>`), `${id}: legacy fee URL remains in sitemap`);
}

console.log(`Validated ${ids.length} combined university pages with preserved fee tables, rankings and FAQs.`);
