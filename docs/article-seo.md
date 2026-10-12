# Article SEO review — 22 September 2026

## Live findings

Direct HTTP checks of all twelve article URLs returned 200. Each had its matching extensionless HTTPS/www canonical, was present in the live sitemap, and had no detected noindex meta tag or X-Robots-Tag. Live robots.txt allows public crawling and advertises the sitemap. This verifies technical accessibility, not Google indexing or rankings. The browsing service returned an older nine-card hub snapshot; direct origin requests were used to verify the current twelve article URLs.

Deployment verified on 22 September 2026 at 07:35 UTC after the user deployed the update. All twelve article pages and the hub return HTTP 200 and exactly match the local generated HTML. Search titles, self-canonicals, sitemap membership and Article/CollectionPage markup pass; no noindex directives were detected. The topic-directory CSS is live. Post-deployment evidence is in `.codex-preview/deployed-article-seo.json`; the earlier audit remains in `.codex-preview/article-live-audit.json`.

## Implemented

- Separate concise search titles from longer editorial headings for every guide. Preserve established URLs and factual qualifications.
- Distinguish document requirements from the visa process and admissions timing, reducing overlap in their search purpose.
- Select related articles by topic rather than the first five articles in generation order.
- Add Article section, word count, official source citations and the article-hub relationship to structured data. Retain visible editorial review dates; do not fabricate authors, credentials, publication dates or fresh fact checks.
- Add matching social titles, descriptions and images, and allow large image previews. This is permission, not a guarantee of a search feature; existing images remain 800px wide.
- Organize the static hub directory into courses/universities, costs/funding and admissions/visas. Add an ItemList to CollectionPage markup for all twelve guides.
- Retain self-canonicals, breadcrumbs, static article content, descriptive links, and sitemap membership. Existing visible FAQs remain useful content; no restricted FAQ rich-result eligibility is claimed.

## Search intent map

These are editorial targets based on page content, not measured keyword volumes. Refine with Search Console query data.

| Article | Main search intent |
| --- | --- |
| Top universities | Malaysia university shortlist, rankings and fees |
| Popular programs | Courses to study in Malaysia and choosing a discipline |
| Cost of living | Student living costs and monthly budgeting |
| Visa process | Malaysia Student Pass process, steps and costs |
| Visa requirements | Required documents and application checklist |
| Scholarships | International-student funding eligibility and conditions |
| Affordable universities | Affordable Malaysian university tuition comparison |
| Processing times | University admission and visa application timing |
| Affordable countries | Comparing study destinations by complete cost |
| MMU vs Taylor's | Course and international-fee comparison |
| Medicine | MBBS/MD admission, fees and recognition |
| Engineering | Discipline, programme accreditation and fees |

## Validation and release

Run `node scripts/build_site_seo.js`, `node scripts/build_site_seo.js --check`, `node tests/article_seo_test.js` and `node tests/student_guides_test.js`.

Deploy the twelve generated `Articles/*.html`, `articles.html` and updated `assets/css/student-guides.css` together. Retain existing assets, robots.txt, .htaccess and sitemap.xml. Keep the changed source modules (`scripts/article_seo.js`, `scripts/student_guides.js`, `scripts/seo_articles.js`) in the source repository so later builds preserve the SEO changes.

After deployment, recheck production titles, canonicals, images and responses. In the verified Search Console property, inspect all twelve URLs and compare Google's selected canonical with the declared URL. Address reported indexing exclusions by their actual cause. Submit or confirm `https://www.onestepmy.com/sitemap.xml`; request indexing for significantly updated priority pages through URL Inspection. Submission does not guarantee indexing. The general Google Indexing API is not an article-submission mechanism.

Record a baseline for article clicks, impressions, CTR and query/page pairs, segmented by country and device. Review comparable 28-day periods, allowing for seasonality and application cycles. Prioritize relevant queries with impressions but weak click-through; check snippet fit and competing page intent before changing copy. Measure qualified fee/profile visits and enquiries separately from raw traffic. Do not claim a traffic uplift until data supports it.

Keep visa guidance and scholarship deadlines under regular source review; refresh fee snapshots when new institution schedules arrive. Seek relevant editorial mentions through useful source-backed comparisons and practical student resources; do not buy links or publish duplicate location pages to manipulate rankings.

## Guidance used

- Google SEO Starter Guide: https://developers.google.com/search/docs/fundamentals/seo-starter-guide
- Google Article structured data: https://developers.google.com/search/docs/appearance/structured-data/article

Neither technical eligibility nor structured data guarantees indexing, rich results or first-page ranking. Search Console was subsequently inspected; verified results are recorded below.

## Verified Search Console baseline

Read through the signed-in onestepmy.com domain property on 22 September 2026. Web search, June 20 to September 19, with page containing /Articles/: 13 clicks, 1.71K impressions, 0.8% CTR and average position 16.2. Filtered totals may be partial. Affordable universities had 5 clicks/288 impressions; medicine 2/341; engineering 2/242. Visible queries include cheap/affordable Malaysian universities and engineering universities; this supports the chosen intent map without implying large search volumes.

Both www and non-www submitted sitemaps show Success with 85 discovered pages, last read September 14 and September 19 respectively. The current live sitemap includes the newer guides. URL Inspection reports the visa requirements guide as unknown to Google with no crawl recorded; an indexing request was initiated. Historical .html/non-www performance entries do not alone establish a current canonical problem: the two sampled aliases currently redirect 301 to their canonical URLs.

Local checks passed: 146 article SEO assertions and 712 browser assertions across 13 pages and four viewport widths; SEO generation is up to date.

Search Console actions: the canonical www sitemap was resubmitted successfully and now reports 88 discovered pages, last read 22 September 2026. The visa-requirements URL received the confirmed Indexing requested verdict and was added to the priority crawl queue. This is not confirmation of inclusion in the index. The courses guide was discovered but not yet indexed; Google subsequently confirmed its indexing request and priority crawl queue entry.

The visa-process guide also received the confirmed Indexing requested verdict. All three new guides were accepted into the priority crawl queue. No claim of completed indexing is made.
