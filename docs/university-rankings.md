# University rankings maintenance

Research verified on **12 September 2026**. All 29 existing university detail pages have static ranking content and four visible FAQs. Universiti Malaya has an additional chatbot record; no new UM detail page was created.

## Editions and evidence

- **QS World 2027**, released 18 June 2026, is the latest verified World edition in this dataset. The [official QS results spreadsheet](https://insights.qs.com/hubfs/Rankings%20Excel%20Reports/2027%20QS%20World%20University%20Rankings%201.1%20%28For%20qs.com%29.xlsx) contains 1,504 institutions, including 32 under Malaysia. The [QS download article](https://www.qs.com/insights/qs-world-university-rankings-2027-results-table-excel), [release corrections](https://www.topuniversities.com/rankings-release-summaries/world-university-rankings-2027-release-summary), and individual QS profiles were checked. Corrections listed at verification did not change the Malaysian entries.
- **QS Asia 2026**, released 4 November 2025, is the latest verified Asia edition. Evidence comes from QS profiles/tables and official university announcements or brochures. Each metric lists its own source IDs. Marketing prose can still describe an older year even when a profile's ranking chart has a newer result; use explicitly dated results.
- **Malaysia position** means the calculated order among the 32 Malaysia entries in QS World 2027. It is not a separate government ranking, an order among only featured universities, or a QS Asia position. QS World and Asia results use different methodologies.
- The World spreadsheet's numeric rank column omits the equals sign. Exact ties were checked against the complete global table, then cross-checked with profile displays. Keep `=528`, `701-710`, and `1401+` as strings. Same bands share a Malaysia position range: SEGi and Lincoln are in **18–20**, Cyberjaya in **24–25**, UniKL in **31–32**. The data cannot determine an exact order inside a band. Private/public filtering uses the spreadsheet's institution-status column, including its private for-profit and not-for-profit categories.

The downloaded World workbook v1.1 SHA-256 was `CF18557A206A75248C921F3B58F4B48CE76463FA5B818DE93358913CEDA94A7A`. This records the version inspected; a later download may differ. Only the necessary ranking facts and source links are stored in the project.

UniKL's Asia 2026 position **=396** was verified in the QS Yearbook 2026 regional table, page 99, using a publicly readable [hosted copy of the QS publication](https://www.scribd.com/document/1051975906/QS-Yearbook-2026). The source record identifies that hosting arrangement. Replace it with a directly accessible QS table or university announcement when one becomes available.

## Scope and gaps

`data/university_rankings.json` is the shared fact source. `api/chatbot/Rankings.php` derives the Malaysia values and formats the chatbot and page FAQs. It never fetches a ranking website during a chat.

- **Not listed**: no separate institution entry in the specified published World table, checked against the complete Malaysia list.
- **Not verified**: the cited research did not confirm that edition's Asia rank. This does not assert that the institution is unranked or unaccredited. Asia 2026 remains unverified for ALFA, AMU, BAC, Binary, Cybernetics, Genovasi, ICMS, Kings, UCMI, IUMW, UNIRAZAK and UOW Malaysia.
- **QS Contributor**: KLUST, formerly IUKL, has this status for Asia 2026; it does not award a numerical rank.
- **Parent institution**: UOW's World 2027 rank **195** belongs to the University of Wollongong in Australia. It is labeled as a parent figure and does not produce a separate UOW Malaysia national position. BAC partner universities and similar names abroad do not transfer their ranks to the Malaysian institution.
- **Ratings and subject results**: QS Stars and SETARA ratings are different from numerical QS ranks. The dataset does not store star-rating awards or verified BBA/IT/MBA/other subject ranks. Unsupported publishers, editions and subjects get an explicit limitation rather than an overall QS rank substituted for the requested fact.

The detail-page update also corrected old unqualified World/Asia claims on APU, UCSI, Lincoln and Taylor's pages. The ambiguous Lincoln THE Impact figure and the undated UCSI music top-50 claim were removed. The ranking handler takes precedence over older FAQ variations and counseling ranking wording.

## Updating an edition

The site now also has an offline SEO build. After the ranking builder, run `node scripts/build_site_seo.js` and its checks; see [SEO maintenance](seo.md). University titles cover courses, fees and QS rankings, while the existing dated ranking facts and FAQs remain authoritative. The site sitemap omits modification dates until reliable per-page editorial dates are maintained.

1. Verify the publisher's released edition and each institution's identity. Record source links and the review date in `data/university_rankings.json`. Do not copy an overseas parent, subject position, star award, South-Eastern Asia subregion rank or an older edition into the overall World/Asia field.
2. For a new World edition, replace the complete Malaysia population in `malaysia_basis.institutions`, its edition and sources. Retain tied ranks and bands. Update the relevant university metrics, `editions` and `verified_at` together. Missing Asia results stay `unverified` until confirmed.
3. Run `php scripts/build_university_rankings.php`. It updates the static detail sections, matching visible/JSON-LD FAQs, titles/descriptions/canonical metadata, dated inline claims, existing ranking answers in `myfaqs.json` and only the corresponding sitemap dates. It preserves FAQ IDs, existing controls and page scripts. Do not edit generated ranking blocks by hand.
4. Run `php scripts/build_university_rankings.php --check`, `php tests/chatbot_rankings_test.php`, the existing chatbot PHP/HTTP/widget suites, and `node tests/university_rankings_pages_test.js`. Reviewed fact assertions should change only after new evidence has been checked. `PHP_BINARY` can specify a portable PHP executable for Node tests. Page tests use installed Playwright Chromium; screenshots go to the OS temp directory. `RANKINGS_BASELINE` optionally points to a pre-update backup to compare controls and scripts.
5. Upload the changed HTML, CSS, sitemap, FAQ JSON, ranking JSON, and complete `api/chatbot/` code together through the site's normal Hostinger release process. The offline builder and tests do not need to run on shared hosting. The knowledge fingerprint resets stale client context after facts change.

Ranking context retains only validated university IDs, scope and edition alongside existing study filters. The chatbot still sends no conversation transcript and uses no external AI service. Existing request/context bounds remain in force.

## Local verification

The existing 67-check and 314-check chatbot suites passed after the update. Dedicated ranking tests cover reviewed facts, source resolution, missing data, entity scope, comparisons, Bengali/Banglish, compound fee questions and 500-turn context. The 500-turn ranking test's maximum request was 180 bytes; the existing fee test remained at 253 bytes. These are local measurements, not a production load test.

All 29 detail pages passed the browser content, schema, native FAQ and tab checks. Existing controls and page scripts matched the pre-update backup. Responsive checks covered APU, BAC, CityU, KLUST and UOW at 1440 px and 390 px, with no ranking-section overflow. FAQ content also worked with JavaScript disabled. The full page run passed 71 checks. Existing FAQ IDs, questions and variants were preserved; only 26 ranking-related answers changed. HTTP checks and the widget contract suite also passed.

The requested computer-use research connection was unavailable after reconnecting, so the research used web access. Page verification used a separate local headless Chromium test, not the user's browser. Screenshots of individual sections hide the existing fixed navigation/chat overlays for capture only; the shipped controls are unchanged. To rerun just selected desktop pages, set `RANKINGS_PAGE_IDS=apu,uow`; responsive/no-JavaScript checks still run.

## Search visibility

Ranking content and FAQ answers are present in the delivered HTML, including when JavaScript is disabled. The `FAQPage` JSON-LD repeats the visible questions and answers; `CollegeOrUniversity` identifies the institution. Canonical links retain the site's extensionless URLs. These changes help crawlers identify the content; indexing and search positions are not guaranteed. Google generally limits FAQ rich results to authoritative government and health sites ([Google documentation](https://developers.google.com/search/blog/2023/08/howto-faq-changes)).
