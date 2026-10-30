'use strict';

const clean = html => String(html).replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/&#0?39;|&apos;/g, "'").replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();
const escape = value => String(value).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

function coursesFromChart(html) {
  const courses = [];
  const seen = new Set();
  for (const match of html.matchAll(/<table\b[\s\S]*?<\/table>/gi)) {
    const preceding = html.slice(0, match.index);
    const categories = [...preceding.matchAll(/<button\b[^>]*class="accordion"[^>]*>([\s\S]*?)<\/button>/gi)];
    const category = clean(categories.at(-1)?.[1] || 'Programmes');
    const rows = [...match[0].matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)];
    const headers = [...(rows[0]?.[1] || '').matchAll(/<t[hd]\b[^>]*>([\s\S]*?)<\/t[hd]>/gi)].map(m => clean(m[1]));
    const nameIndex = headers.findIndex(h => /^(?:program(?:me)?s?(?: name| \/ category)?|courses)$/i.test(h));
    if (nameIndex < 0) continue;
    const durationIndex = headers.findIndex(h => /duration|^year$/i.test(h));
    const feeIndex = headers.findIndex(h => /(?:year\s*1\b|1st\s*year|first\s*year|fees?\s*1\s*year|per\s*year)/i.test(h) && !/initial|admin|following/i.test(h));
    const pending = new Map();
    for (const row of rows.slice(1)) {
      const cells = [];
      for (const [column, span] of pending) {
        cells[column] = span.value;
        if (--span.remaining === 0) pending.delete(column);
      }
      let column = 0;
      for (const cell of row[1].matchAll(/<t[hd]\b([^>]*)>([\s\S]*?)<\/t[hd]>/gi)) {
        while (cells[column] !== undefined) column++;
        const value = clean(cell[2]);
        const rowspan = Number(cell[1].match(/rowspan=["']?(\d+)/i)?.[1] || 1);
        const colspan = Number(cell[1].match(/colspan=["']?(\d+)/i)?.[1] || 1);
        for (let offset = 0; offset < colspan; offset++) {
          cells[column + offset] = value;
          if (rowspan > 1) pending.set(column + offset, {value, remaining:rowspan - 1});
        }
        column += colspan;
      }
      const name = cells[nameIndex];
      if (!name || /^(?:total|programme|program|courses)$/i.test(name)) continue;
      const key = category + '|' + name;
      if (seen.has(key)) continue;
      seen.add(key);
      let duration = durationIndex >= 0 ? cells[durationIndex] : '';
      if (duration && /^\d+(?:\.\d+)?$/.test(duration)) {
        duration += /month/i.test(headers[durationIndex]) ? ' months' : ' years';
      }
      const fee = feeIndex >= 0 ? cells[feeIndex] : '';
      const availableFee = fee && !/^[-–—]|^n\/?a$/i.test(fee) ? fee : null;
      const formattedFee = availableFee && /^[\d,. ]+$/.test(availableFee) ? `${/USD/i.test(headers[feeIndex]) ? 'USD' : 'MYR'} ${availableFee}` : availableFee;
      courses.push({name, category, duration:duration || 'Confirm duration', fee:formattedFee, feeLabel:feeIndex >= 0 ? headers[feeIndex] : null});
    }
  }
  return courses;
}

function renderCourses(id, university, chart) {
  const courses = coursesFromChart(chart);
  if (!courses.length) throw Error(`No course rows found for ${id}`);
  return `<section id="courses" class="combined-shell courses-tab" aria-labelledby="courses-title" hidden>
<div class="combined-section"><div class="section-heading"><p>Find your programme</p><h2 id="courses-title">Courses at ${escape(university)}</h2></div><p>Explore ${courses.length} course listings from our published fee chart. Confirm availability and fees for your intake. First-year amounts retain their source labels; other compulsory charges may apply.</p><label class="course-search-label" for="course-search">Search courses</label><input id="course-search" class="course-search" type="search" placeholder="Search by course or category"><p class="course-result-count" aria-live="polite">${courses.length} courses</p></div>
<div class="course-list">${courses.map(course => {
    const message = `Hello One-Step, I would like to ask about ${course.name} at ${university} (${course.category}). Please confirm the first-year fees, duration and next intake.`;
    return `<article class="course-card" data-course-search="${escape((course.name+' '+course.category).toLowerCase())}"><div class="course-card-copy"><p class="course-category">${escape(course.category)}</p><h3>${escape(course.name)}</h3><p class="course-university">${escape(university)}</p><div class="course-facts"><span><strong>First-year fees:</strong> ${course.fee ? escape(course.fee) + ' <small>('+escape(course.feeLabel)+')</small>' : 'Ask us for a quote'}</span><span><strong>Duration:</strong> ${escape(course.duration)}</span></div></div><div class="course-card-actions"><a class="course-apply" href="/apply?university=${id}&amp;course=${encodeURIComponent(course.name)}">Apply Now</a><a class="course-ask" href="https://wa.me/601119359497?text=${encodeURIComponent(message)}" target="_blank" rel="noopener noreferrer">Ask Us</a></div></article>`;
  }).join('\n')}</div><p class="course-empty" hidden>No courses match your search.</p></section>`;
}

module.exports = {coursesFromChart, renderCourses};
