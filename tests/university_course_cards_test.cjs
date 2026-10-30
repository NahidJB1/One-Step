'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const {coursesFromChart, renderCourses} = require('../scripts/university_course_cards');

const fixture = `<button class="accordion">Business</button><table><tr><th>Programme</th><th>Duration (Years)</th><th>Year 1 (RM)</th><th>Total</th></tr><tr><td rowspan="2">Business &amp; Management</td><td rowspan="2">3</td><td>11,000</td><td>33,000</td></tr><tr><td>12,000</td><td>33,000</td></tr></table>`;
assert.deepEqual(coursesFromChart(fixture), [{name:'Business & Management', category:'Business', duration:'3 years', fee:'MYR 11,000', feeLabel:'Year 1 (RM)'}]);
const totalOnly = '<table><tr><th>Programme</th><th>Duration</th><th>Total Tuition Fee</th></tr><tr><td>Computing</td><td>3 Years</td><td>RM 60,000</td></tr></table>';
assert.equal(coursesFromChart(totalOnly)[0].fee, null, 'Total tuition must never become first-year tuition');
const bundled = totalOnly.replace('Total Tuition Fee','Initial, Admin &amp; 1st Year Tuition fee');
assert.equal(coursesFromChart(bundled)[0].fee, null, 'Bundled initial charges must never become first-year tuition');
const html = renderCourses('test','Test University', fixture);
assert.ok(html.includes('/apply?university=test&amp;course=Business%20%26%20Management'));
assert.ok(html.includes('https://wa.me/601119359497?text='));
const cyberjaya = coursesFromChart(fs.readFileSync('Fees_Chart/cyberjaya-fees.html','utf8'));
assert.ok(cyberjaya.some(c => /FOUNDATION IN SCIENCE/i.test(c.name) && c.fee === 'MYR 12,466'), 'Use authored Cyberjaya fee chart');
console.log('Course card extraction, fee labels, rowspan handling and action links passed.');
