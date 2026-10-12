# Student guides

The six core guides are authored in `scripts/student_guides.js` and rendered by the existing SEO build. Edit that source rather than the generated HTML. The review date is an explicit editorial date; builds do not advance it.

Six established articles are now authored in `scripts/legacy_student_guides.js`, using the same renderer: affordable universities, application timelines, affordable countries, MMU vs Taylor's, medicine and engineering. All twelve retain extensionless URLs and have contextual links, source notes, image grids, comparison tables and FAQs. The related-guide list is capped at five.

The older articles were reviewed on 21 September 2026 and locally verified on 22 September. Unsupported visa-success rates and university speed rankings were removed. Medical qualifications retain their exact MD/MBBS names; EAC accreditation is programme- and cohort-specific. Country comparisons link official portals rather than claiming universal tuition or visa rules. Scholarship calls with expired deadlines are labelled closed.

New official Taylor's 2026 computing and medicine fees are distinguished from older stored schedules. MMU's December 2025 programme fees retain their currency and exclusions. Stored fee examples in the affordable and medical articles are editorial snapshots, not live quotes; review them when updating the JSON. No currencies or incompatible fee bases are combined. These copy changes do not modify source fee records.

- Updated existing URLs: top universities, living costs, scholarships.
- New URLs: popular programs of study, visas and requirements, Malaysia student visa requirements.
- The university shortlist is limited to institutions already covered by One-Step. It is not a national top-ten ranking. QS world bands and ties retain their published meaning.
- The programs page is a field-selection guide, not an unsupported popularity league table. Fee examples are read from the existing JSON with the original fee labels.
- The visa overview explains the process; the requirements article covers document preparation. Use EMGS and Immigration as the primary sources when reviewing them.
- The cost chart is explicitly illustrative. RM1,800 monthly, RM21,600 for 12 months, and RM23,760 including a hypothetical 10% reserve. Published EMGS accommodation estimates retain USD units.
- The scholarship guide distinguishes the closed MIS 2026/2027 application from other funding enquiries. No next-round deadline is invented. Review the MOHE portal before changing its status.

Official source links appear alongside claims and in each guide's source section. QS profiles, EMGS guidance, Immigration, MQA and the MOHE MIS portal/guidelines were checked on 21 September 2026. New copy does not establish current validity for all stored university fee schedules.

## Images

`assets/images/guides/sources.json` maps each 800×520 WebP to its existing university-gallery original. Original assets are preserved. Derivatives were resized/cropped with Sharp at quality 78. All article photographs are local, dimensioned and lazy-loaded, with descriptive alt text and named-campus captions where appropriate. These assets inherit their original rights; no new stock-image licence is claimed.

## Verification

```text
node scripts/build_site_seo.js
node scripts/build_site_seo.js --check
node tests/student_guides_test.js
node tests/seo_pages_test.js
```

The focused browser check covers all twelve guides and the hub at 1440, 768, 390 and 320 pixels; internal destinations and anchors; images; runtime errors; FAQ interaction; metadata; chart arithmetic; scope; and content without JavaScript. Screenshots are written under `.codex-preview/student-guides/`.

On 21 September 2026, the focused check passed 365 assertions and the SEO build reported zero outdated outputs. The broader pre-existing SEO test stopped at `Fees_Chart/alfa-fees.html remarks preserved`: it reads visible text with JavaScript disabled, while the existing stylesheet deliberately collapses fee panels. The fee remarks are present in the generated HTML. That unrelated fee-panel behaviour and its test were not changed in this article update.

Deployment is separate from the local build. Preserve the established extensionless article URLs, and deploy new pages, shared CSS, image derivatives, hub and sitemap together. Search ranking and traffic changes require post-deployment measurement; the content update does not guarantee traffic.

On 22 September 2026, the expanded focused check passed 716 assertions across twelve guides and the article hub at all four widths. The SEO build reported zero outdated files. A duplicate timeline enquiry/FAQ anchor found during verification was corrected. Desktop medicine and mobile affordable-university screenshots were also visually reviewed. The additional Cyberjaya anatomy image is recorded in the image source manifest. These changes are local and have not been deployed.
