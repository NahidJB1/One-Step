'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const {accommodation, renderAccommodation} = require('../scripts/university_accommodation');
assert.equal(Object.keys(accommodation).length,12);
assert.equal(Object.values(accommodation).reduce((n,u)=>n+u.properties.length,0),36);
const esc = value => String(value).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
for (const [id,data] of Object.entries(accommodation)) {
  const html = fs.readFileSync(`Universities/${id}-university.html`,'utf8');
  assert.ok(html.includes('href="#accommodation" aria-controls="accommodation"'));
  for (const p of data.properties) {
    for (const field of ['travel','amenities','rent']) assert.ok(p[field].every(value=>!value.includes('\u2022')), `${id}: ${field} items must be separate entries`);
    for (const text of [p.name,p.location,p.type,p.unitTypes,...p.amenities,...p.rent]) assert.ok(html.includes(esc(text)),`${id}: missing ${text}`);
  }
  assert.equal((html.match(/data-accommodation-photo/g) || []).length, data.properties.length, `${id}: property photo slots are incomplete`);
  assert.equal((html.match(/data-property-index=/g) || []).length, data.properties.length, `${id}: photo request indices are incomplete`);
}
assert.equal(renderAccommodation('help','HELP University'),'');
const klust = renderAccommodation('klust','KLUST');
assert.ok(!klust.includes('5816 min') && !klust.includes('6240 min'));
assert.ok(klust.includes('Confirm travel time'));
const apu = renderAccommodation('apu','APU');
assert.ok(apu.includes('confirm rental period'));
assert.ok(!apu.includes('Approximate rent per month'));
assert.ok(apu.includes('https://wa.me/601119359497?text='));
const endpoint = fs.readFileSync('api/accommodation-photo.php','utf8');
assert.ok(endpoint.includes("getenv('GOOGLE_MAPS_API_KEY')"), 'Google key must come from server configuration');
assert.ok(!endpoint.includes('AIza'), 'Google key must not be committed to the endpoint');
assert.ok(endpoint.includes('university_accommodation.json'), 'Photo endpoint must allowlist the accommodation dataset');
assert.ok(endpoint.includes('authorAttributions') && endpoint.includes('googleMapsUri'), 'Google photo attribution and source link must be returned');
console.log('Accommodation checks passed: 12 universities, 36 properties, supplied rents and amenities preserved, ambiguous times and rental periods qualified.');
