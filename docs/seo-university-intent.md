# University SEO implementation — 26 September 2026

Implemented in the local One-Step workspace. No production upload or Search Console submission was performed. Existing unrelated workspace changes were preserved. This document supplements the earlier implementation record in `docs/seo.md`; the validation results below describe this update.

**Post-deployment update:** The user subsequently deployed these changes. Live verification and Search Console actions are recorded in [Search Console deployment review](search-console-2026-09-26.md). The implementation-phase statements below remain a historical record.

## Query ownership

Keep the existing canonical URLs. Both pages remain indexable and self-canonical; neither should canonicalize to the other.

| University / URL ID | Fee page focus | Details page focus and distinction |
| --- | --- | --- |
| BAC / `bac` | Tuition by BAC Education Group institution; transfer-stage costs | Institution, awarding body and study pathway; BAC College is not the entire group |
| ALFA / `alfa` | International tuition, annual/resource columns and initial charges | University College courses, Subang Jaya, intake and accreditation checks |
| INTI / `inti` | International tuition by Nilai, Subang and Penang campus | University versus college, campus-specific programmes and intakes |
| City University / `cityu` | Malaysia international programme fees | Malaysian institution, courses, rankings and campus/intake planning |
| University of Cyberjaya / `cyberjaya` | Authored international fee chart and qualification-specific costs | Programme, ranking and intake planning; distinguish health-course requirements |
| SEGi University / `segi` | University international tuition and payment notes | Kota Damansara university; distinguish SEGi colleges |
| Taylor's University / `taylors` | International tuition and programme fee periods | University, courses, rankings and intakes; distinguish Taylor's College |
| APU / `apu` | International tuition by programme and award conditions | Malaysian courses, rankings, intakes and international scholarship eligibility |
| UniKL / `unikl` | International tuition by programme/institute | Course plus institute/campus selection and intake planning |
| UCSI / `ucsi` | Malaysian-campus international tuition | Malaysia courses, ranking and intakes; distinguish Dhaka branch |

Fee owners are `/Fees_Chart/{id}-fees`. Details owners are `/Universities/{id}-details`. Generic course/campus/ranking searches belong to details. Named programme costs belong to the fee chart. Broad “cheapest universities,” “top universities,” “Malaysia scholarships,” and visa queries remain owned by their existing guides, with contextual links from university pages.

## What changed

- Twenty unique titles and descriptions, with fee/tuition intent reserved for fee-page titles. Long institution names take priority over repeating the site brand.
- Fee H1s describe tuition. A short scope explanation identifies the campus or institution covered, followed by direct links to the tables, cost guidance and FAQs.
- Each fee chart includes tailored explanations of its existing column labels and payment notes, Bangladesh budgeting guidance, conditional scholarship wording, two institution-specific FAQs plus four source/budget FAQs, and a link to its university details page.
- Details pages include an early decision guide, course/intake planning, Bangladesh qualification considerations, scholarship conditions, official sources and relevant comparison/article links. Selected programme examples retain the stored schedule's duration and intake wording and are explicitly labelled as schedule examples, not current availability confirmations.
- Existing unsupported sidebar average-fee ranges, visa-approval rates and the ALFA 100% employability claim were removed where matched. Broad intake month lists now point to programme-specific guidance.
- Fee panels are readable without JavaScript. Enhanced accordions and search remain available; section links open their table and clear conflicting filters, including repeated anchor clicks and arrival from a details-page link.
- Shared navigation is readable over university heroes. New guide sections have responsive layouts, keyboard focus indicators and contained tables. Mobile guide-card width was corrected after visual inspection.
- Both generators read priority metadata from the same editorial source, preventing a ranking rebuild from restoring fee-focused details titles. Regenerating rankings also repaired corrupted punctuation on 19 additional details pages; ranking facts were not changed.

## Source and maintenance contract

Edit `data/university_seo_content.json` for the ten institutions' metadata, guidance, FAQs and official source links. `scripts/university_seo_content.js` renders it. Do not hand-edit generated sections in the HTML.

`data/fees_data.json` and `data/university_rankings.json` are byte-for-byte unchanged from the task baseline. The fee-table regression compares every generated cell and note with the source. Cyberjaya's richer authored tables are preserved rather than replaced with its incomplete JSON record. Ranking dates/editions retain their existing provenance; this task is not a new verification of every ranking figure.

Do not infer a total, annual rate, BDT conversion, scholarship entitlement, universal HSC/IELTS requirement or open intake from incomplete data. New schedules and admissions facts require official programme-specific evidence. The stored fee documents retain their own printed validity dates; the implementation date is not a verification date. A full audit of legacy promotional statements elsewhere on the site remains separate.

Research informed the institution distinctions and official source links. It was not an exhaustive top-ten competitor audit for all twenty keyword groups, and no paid keyword-volume data or Search Console baseline was available. No numerical traffic, CTR or ranking improvement is claimed.

## Rebuild and validation

```text
php scripts/build_university_rankings.php
node scripts/build_site_seo.js
php scripts/build_university_rankings.php --check
node scripts/build_site_seo.js --check
node tests/seo_pages_test.js
node tests/university_seo_layout_test.js
php tests/chatbot_rankings_test.php
node tests/article_seo_test.js
node tests/chatbot_frontend_test.js
```

Results for this update:

- SEO integration: **1,613 passing checks**, 74 HTML pages, 89 unique sitemap entries. Covers metadata, canonicals, links, table/source parity, visible FAQ/schema parity, original controls, all ten universities' interactive fee pages, downloads and browser errors.
- Additional layout regression: **240 passing checks**, all 20 target pages at 320, 390, 768 and 1440 pixels, including actual guide-section bounds and expanded content.
- Ranking suite: **381 passed, 0 failed**. Article SEO: **146 passed**. Chatbot widget contract suite: passed.
- Both generators report **zero outdated files**.
- Chrome Computer Use review confirmed BAC section navigation and the corrected UCSI mobile guide card. Existing desktop/mobile controls were also exercised by browser tests.

The local test server does not execute production Apache rewrite rules. Local tests do not demonstrate live crawling, indexing, performance, conversions or ranking gains.

## Release scope and measurement

Public release files for this task are the ten target `Fees_Chart/*-fees.html` files, all 29 regenerated `Universities/*-details.html` files (19 have ranking-punctuation repairs only), `assets/css/study-content.css` and `assets/js/fees.js`. Keep the editorial JSON, both updated generators, rendering helper and tests in the source repository. No new server-side runtime or AI service is required. The existing sitemap and redirects did not need URL changes for this update.

Before production release, review the current workspace's other pending work separately; do not upload the entire dirty checkout blindly. After release, check target responses, canonical tags, rendered HTML, CSS/JS, fee-section links and downloads on the real hostname, then inspect representative URLs in Search Console.

Record a Bangladesh-country baseline by page and query cluster before measuring results: impressions, clicks, CTR, average position and qualified enquiries. Compare complete 28-day windows, with a year-over-year check where possible because intake demand is seasonal. Split mobile/desktop and fee/details queries. A CTR change must be interpreted alongside position and query mix. If the wrong page earns impressions for a cluster, inspect headings, internal anchors and competing articles before revising the assigned owner. Prioritize subsequent edits using actual impressions and enquiries rather than assumed keyword volume.
