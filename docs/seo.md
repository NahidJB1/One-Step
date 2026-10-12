# Search visibility and content maintenance

For the 26 September 2026 update to the ten priority universities, see [University SEO intent implementation](seo-university-intent.md), including current validation results and release scope. The record below describes the earlier baseline.

Implemented locally on 14 September 2026. These changes have not been deployed to Hostinger or submitted to Google Search Console. Search positions, indexing and traffic are not guaranteed.

## Findings and changes

| Finding | Change |
| --- | --- |
| Most fee pages delivered a loading placeholder; the full table required the entire fee JSON database. | 26 pages now deliver their complete JSON-derived tables and notes in HTML. The three authored chart pages (Cyberjaya, Cybernetics, Genovasi) retain their existing tables. All 29 use progressive enhancement for search and accordions. |
| Hidden SEO summaries combined different periods and charges into misleading fee ranges, included `RM TBD`, and asserted universal Bangladesh rates. | Removed those summaries and keyword lists. Added visible guidance, six accessible fee FAQs per page, and matching FAQ schema. Every generated table retains its source cells and fee notes. |
| Fee JavaScript overwrote descriptive page titles and advertised all amounts as official semester fees. | Titles stay stable. Fees are described by their actual column labels; stored schedules have crawlable PDF/ZIP download links. |
| University detail pages emphasized rankings but lacked clear international fee/scholarship guidance. | All 29 link directly to their fee chart and explain fee periods, Bangladesh applicant considerations and conditional scholarships. Existing ranking facts, FAQs, tabs and controls remain. |
| The sitemap contained only 59 entries, omitting articles and hubs. | 85 public canonical URLs now cover university profiles, fee charts, all nine articles, country pages and public hubs. Utility/test pages are excluded. |
| Articles repeated old QS figures or unsupported scholarship/cheapest claims. | Rebuilt the Top 10, affordability, scholarship, engineering and MMU–Taylor's articles from the stored ranking and fee information. Added descriptive metadata, Article/Breadcrumb schema and related links across all nine articles. |
| Discovery depended on JavaScript-created university cards. | Home and Explore have crawlable university/profile/fee directories in HTML; Articles has a complete guide directory. |
| HTTP requests to the www hostname were not forced to HTTPS; legacy aliases could miss their redirect after the `.html` redirect. | Production-host HTTPS/www rules, homepage consolidation and legacy extensionless aliases are covered in `.htaccess`. Internal CityU links now point directly to the canonical fee URL. |

## Page/query ownership

Avoid creating near-duplicate landing pages for each keyword variation or nationality. One useful page should satisfy a related group of queries.

| Search intent | Preferred page |
| --- | --- |
| University name, courses, campus, QS World/global/Asia/Malaysia rank | `Universities/[id]-details` |
| University tuition fees, international/Bangladeshi student fees, fee chart, semester/year payment breakdown, fee documents | `Fees_Chart/[id]-fees` |
| University scholarship eligibility and reductions | University fee/detail guidance linked to the scholarship guide and the relevant application route |
| Top 10 universities in Malaysia | `Articles/top-10-universities-in-malaysia` |
| Cheapest/affordable Malaysian universities | `Articles/cheapest-universities` |
| International student scholarships | `Articles/scholarships-for-international-students-malaysia` |

The Top 10 is the first ten Malaysian entries in the complete stored QS World 2027 table, not an order of One-Step partners. Malaysia position is a calculation within that table. The affordability article is explicitly an editorial shortlist with bachelor's program examples, not a proven countrywide cheapest ranking. It does not annualize totals, sort incompatible fee bases or turn conditional discounts into guaranteed prices.

## Rebuild after editing data

On a development machine with Node installed:

```text
npm run build:seo
npm run check:seo
npm run test:seo
node tests/chatbot_frontend_test.js
```

`scripts/build_site_seo.js` uses `scripts/seo_helpers.js` and `scripts/seo_articles.js`. It generates static HTML from the existing local JSON and authored content. No Node, Playwright, AI API, extra database or new runtime service is needed on Hostinger. The `--check` option reports outdated output without writing files. Running an unchanged build produces no changes.

The old `seo_generate.js`, `seo_generate_runner.py` and `seo_update.ps1` entry points delegate to this builder so they no longer recreate hidden content or erroneous aggregated fees. Do not run other legacy one-off rewriting scripts against generated pages.

After changing ranking facts, first follow `docs/university-rankings.md` and run:

```text
php scripts/build_university_rankings.php
node scripts/build_site_seo.js
php scripts/build_university_rankings.php --check
node scripts/build_site_seo.js --check
php tests/chatbot_rankings_test.php
node tests/seo_pages_test.js
```

The ranking builder continues to own the ranking fact/FAQ blocks. Both builders use matching university title/description wording. The SEO build does not change chatbot runtime files or knowledge data.

Cyberjaya, Cybernetics and Genovasi have authored tables that are more complete than their JSON entries. Update those tables directly and verify the chatbot's separate record coverage when changing their fees. Do not replace them automatically with their partial JSON data.

## Accuracy and dates

- A page build date is not a fee verification date. Year-specific fee titles appear only when the supplied validity field identifies a single year. Preserve source dates, campus restrictions, fee periods, taxes, missing values and scholarship conditions.
- Download links open stored schedules. One-Step does not become the official university website by hosting a copy. Check the schedule edition and obtain current written confirmation for an intake.
- Sitemap `lastmod` is omitted because there is no reliable editorial modification ledger. Build/file-copy times and ranking review dates would misrepresent updates to other page content.
- Ranking verification remains 12 September 2026, with World 2027 and Asia 2026 as recorded in `data/university_rankings.json`. This SEO work did not independently reverify every ranking source.
- The scholarship article no longer advertises unsupported universal award amounts. It explains the actual conditional reduction wording in selected fee schedules.
- The four other articles (affordable countries, living costs, processing times, MBBS) received technical SEO and linking updates, not a complete factual re-verification. Review their financial, medical, eligibility and visa claims against current primary sources before presenting them as recently verified. Existing promotional claims elsewhere on the site also need their own evidence review.
- Do not add fictitious authors, reviews, ratings, award deadlines, scholarship guarantees, fee years or official affiliations to structured data. The Article author/publisher is the site's organization; no fabricated individual expert credentials were added.
- FAQ content is useful for visitors, but this education advisory site should not expect Google's government/health-only FAQ rich result treatment.

## Verification and deployment

Final local run: **1,183 passing checks across 71 HTML pages**, 85 unique sitemap URLs, no broken internal links in the scanned pages and no uncaught errors in the interactive browser checks. Actual APU, CityU and Cybernetics fee-document downloads completed successfully. All 85 sitemap canonical targets were also checked separately. The build check reported zero outdated outputs, and the chatbot widget contract suite passed. Screenshots were inspected at mobile viewport size; no production traffic impact has been measured.

`tests/seo_pages_test.js` checks the initial HTML with JavaScript disabled, every generated table cell and note against the JSON, visible FAQ/schema parity, original university controls, local links, canonical URLs, sitemap coverage, search, accordions, downloads, stable titles and responsive layouts in Chromium. Screenshots go to the OS temporary directory under `onestep-seo-page-checks`. `tests/seo_preserved_controls.json` records the original detail-page buttons and inputs before this update.

The test server serves local HTML; it does not execute Apache `.htaccess` rules or PHP. PHP execution was blocked by Windows Application Control during this task, so the PHP chatbot/ranking suites and PHP ranking-builder check could not be rerun. The JavaScript chatbot widget contract suite passed. Run the PHP checks in an allowed development or staging environment before release; do not treat the earlier conversation's PHP test results as a new run.

Upload the changed public HTML, `assets/js/fees.js`, `assets/css/study-content.css`, `.htaccess`, `robots.txt` and `sitemap.xml` together. The build scripts and tests are development tools, not production dependencies. Keep existing application and chatbot runtime files in the release as usual.

After release:

1. Verify one HTTPS canonical university, fee and article URL returns 200. Check representative mobile searches, accordions, downloads, navigation and the application flow without submitting test applications.
2. Verify HTTP/www, `/index.html`, an old CityU fee alias and `.html` variants redirect to the intended canonical URLs without loops. Confirm a nonexistent URL returns 404. This requires the actual Apache/Hostinger environment.
3. In the verified Search Console domain property, submit `https://www.onestepmy.com/sitemap.xml`. Inspect representative fee, detail and article URLs and confirm Google's rendered page includes the same tables and headings. Request indexing for the important updated pages.
4. Record a performance baseline and compare subsequent 28-day periods: impressions, clicks, CTR, query groups, landing pages and country (especially Bangladesh). Check indexing exclusions, Core Web Vitals and conversions separately. There is no Search Console access or traffic baseline established by this local build.
5. Use actual query impressions to identify missing useful content. Extend course-specific answers and source coverage where students need them. Avoid duplicating pages for spelling variants, purchasing spam links or adding keyword lists.

## Google guidance used

- [Search Essentials](https://developers.google.com/search/docs/essentials): useful content, descriptive language and crawlable links.
- [JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics): initial HTML, rendering and stable metadata.
- [Helpful, reliable content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content): evidence, transparent sourcing and avoiding artificial freshness.
- [Build a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap): canonical URL discovery and meaningful modification dates.
- [FAQ rich result changes](https://developers.google.com/search/blog/2023/08/howto-faq-changes): eligibility limits.
