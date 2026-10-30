'use strict';
const accommodation = require('../data/university_accommodation.json');
const esc = value => String(value).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

function renderAccommodation(id, university) {
  const data = accommodation[id];
  if (!data) return '';
  return `<section class="combined-shell accommodation-tab" id="accommodation" aria-labelledby="accommodation-title" hidden>
<div class="combined-section"><div class="section-heading"><p>Find a place to stay</p><h2 id="accommodation-title">Accommodation for ${esc(university)}</h2></div><p>Compare the locations, room options and indicative rents below. Confirm availability, deposits, utilities and your teaching campus before choosing a room.</p><p class="accommodation-note">Travel estimates depend on your campus and route. ${data.rentPeriod ? 'Rents are approximate monthly figures.' : 'Rental periods are not specified for these listings; confirm the rate and period before booking.'}</p></div>
<div class="accommodation-grid">${data.properties.map((property, propertyIndex) => {
    const travel = property.travel.map(value => {
      const minutes = value.match(/:\s*(\d+)\s*min/i);
      return minutes && (Number(minutes[1]) === 0 || Number(minutes[1]) > 240) ? `${value.split(':')[0]}: Confirm travel time` : value.replace('Not specified on page','Confirm travel time');
    });
    const message = `Hello One-Step, I am interested in ${property.name} for ${university}. Please confirm room availability, rent period, deposits and travel to my teaching campus.`;
    return `<article class="accommodation-card"><div class="accommodation-photo" data-accommodation-photo data-university="${esc(id)}" data-property-index="${propertyIndex}" aria-label="Photo of ${esc(property.name)}"><div class="accommodation-photo-placeholder" aria-hidden="true"><span>Property photo</span></div></div><div class="accommodation-card-body"><div class="accommodation-card-heading"><p class="accommodation-type">${esc(property.type)}</p><h3>${esc(property.name)}</h3><p class="accommodation-location">${esc(property.location)}</p></div><dl class="accommodation-facts"><div><dt>Unit options</dt><dd>${esc(property.unitTypes)}</dd></div><div><dt>Travel estimates</dt><dd><ul>${travel.map(value=>`<li>${esc(value)}</li>`).join('')}</ul></dd></div><div><dt>Amenities</dt><dd><ul>${property.amenities.map(value=>`<li>${esc(value)}</li>`).join('')}</ul></dd></div></dl><div class="accommodation-rent"><h4>${data.rentPeriod ? 'Approximate rent per month' : 'Listed rent · confirm rental period'}</h4><ul>${property.rent.map(value=>`<li>${esc(value)}</li>`).join('')}</ul></div><div class="accommodation-actions"><a class="accommodation-map" href="https://www.google.com/maps/search/?api=1&amp;query=${encodeURIComponent(property.name+' '+property.location)}" target="_blank" rel="noopener noreferrer">View location</a><a class="accommodation-ask" href="https://wa.me/601119359497?text=${encodeURIComponent(message)}" target="_blank" rel="noopener noreferrer">Ask about this property</a></div></div></article>`;
  }).join('\n')}</div></section>`;
}

module.exports = {accommodation, renderAccommodation};
