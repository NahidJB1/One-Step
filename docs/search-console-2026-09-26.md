# Search Console deployment review — 26 September 2026

Property: `sc-domain:onestepmy.com`. Actions were performed in the connected Chrome Search Console session after the user confirmed deployment.

## Live deployment checks

All 20 priority university URLs returned HTTP 200 at their intended HTTPS/www extensionless URL, contained the new intent guidance and expected decoded title, declared a matching self-canonical, and had no detected noindex meta/header directive. The sitemap, robots.txt, study-content.css and fees.js matched the local versions. The sitemap contains 89 URLs. Robots.txt permits these public pages.

Google accepted resubmission of `https://www.onestepmy.com/sitemap.xml` and displayed “Sitemap submitted successfully.” The www sitemap row changed its submitted date to September 26. Its previously processed count was still 88 URLs, last read September 22; this is not evidence of a completed reread of the new 89-URL sitemap. The existing non-www submission showed Success, 89 discovered URLs and last read September 25. Neither sitemap was removed.

## Pre-update performance baseline

Search type: Web. Date range displayed: August 28–September 24, 2026 (28 days). All devices. These dates precede this deployment.

| Scope | Clicks | Impressions | CTR | Average position |
| --- | ---: | ---: | ---: | ---: |
| Entire site, all countries | 199 | 15.4K displayed | 1.3% | 11.1 |
| Entire site, Bangladesh | 43 | 2.03K displayed | 2.1% | 8.6 |
| Exact 20 target URLs, Bangladesh | 6 | 348 | 1.7% | 9.7 |

The page filter uses the exact canonical URLs:

```text
^https://www\.onestepmy\.com/(Fees_Chart/(bac|alfa|inti|cityu|cyberjaya|segi|taylors|apu|unikl|ucsi)-fees|Universities/(bac|alfa|inti|cityu|cyberjaya|segi|taylors|apu|unikl|ucsi)-details)$
```

Search Console warns that filtered chart and table results may be partial. A missing page row means no row was reported for this filter/window, not that the page is unindexed. Country identifies the search location, not nationality. Rounded figures above are the UI's displayed values.

| Target page | Clicks | Impressions | CTR | Position |
| --- | ---: | ---: | ---: | ---: |
| ALFA fees | 5 | 94 | 5.3% | 4.5 |
| ALFA details | 1 | 22 | 4.5% | 13.7 |
| Taylor's fees | 0 | 83 | 0% | 8.7 |
| CityU details | 0 | 36 | 0% | 11.1 |
| APU details | 0 | 22 | 0% | 11.1 |
| SEGi details | 0 | 21 | 0% | 16.4 |
| BAC details | 0 | 13 | 0% | 6.6 |
| INTI fees | 0 | 12 | 0% | 9.7 |
| INTI details | 0 | 10 | 0% | 13.4 |
| Cyberjaya details | 0 | 8 | 0% | 10.4 |
| UniKL details | 0 | 8 | 0% | 33.1 |
| SEGi fees | 0 | 6 | 0% | 28.2 |
| BAC fees | 0 | 5 | 0% | 7.0 |
| CityU fees | 0 | 3 | 0% | 5.0 |
| UniKL fees | 0 | 3 | 0% | 5.7 |
| UCSI fees | 0 | 2 | 0% | 6.5 |

No page rows were reported for APU fees, Cyberjaya fees, Taylor's details or UCSI details in this filtered window. Do not replace missing rows with assumed zero performance.

For the same twenty-page Bangladesh filter: desktop had 4 clicks / 117 impressions / 3.4% CTR / position 13.8; mobile had 2 / 229 / 0.9% / 7.6; tablet had 0 / 2 / 0% / 8.5. These small samples warrant monitoring, not a causal conclusion about page design.

Selected query evidence: “taylor university tuition fees for international students” had 30 impressions, 0 clicks and position 8.8; “city university malaysia qs ranking” had 11 impressions, 0 clicks and position 8.0; “apu qs ranking” had 10 impressions, 0 clicks and position 9.7. These are small samples; use them as monitoring priorities, not proof of a CTR problem or guaranteed uplift.

The CSV export endpoint was blocked by Chrome (`ERR_BLOCKED_BY_CLIENT`). No browser protection was bypassed. The baseline above was transcribed from the report's visible data; it is not a successfully downloaded export.

## Indexing report interpretation

The September 21 coverage report showed 104 indexed and 277 excluded URLs across all known URLs. Filtering to all submitted pages showed 82 indexed and three excluded. These reports predate the deployment and contain historical URLs; the 277 exclusions are not 277 broken landing pages.

- `explore-universities`: the older report listed “Crawled - currently not indexed,” but current URL Inspection says “URL is on Google / Page is indexed.” No validation was started for that stale status.
- `scholarship-options`: current inspection reported Google selected the non-www URL, while the page declares www. Live HTTP checks confirmed the non-www URL now returns a 301 to the www self-canonical page. Validation was started and Google displayed “Validation Started,” September 26. Validation has not yet passed.
- `malaysia-scholarship`: the older report said “Discovered - currently not indexed”; current URL Inspection says “URL is on Google / Page is indexed.” No validation was started for that stale status.

Manual actions and Security issues both reported **No issues detected**. Breadcrumbs reported **48 valid items, 0 invalid, no critical issues**. Core Web Vitals reported insufficient usage data for both mobile and desktop over the last 90 days; this is not a passing or failing field-performance result.

## Final URL inspection and crawl-request ledger

All twenty target URLs were individually inspected and reported **URL is on Google / Page is indexed**. This confirms existing index coverage, not that today's content is already reflected in search results. For example, APU fees had a last crawl of September 22 at 6:45:52 PM, successful Googlebot smartphone fetch, indexing allowed and Google-selected canonical equal to the inspected URL.

Google confirmed **12 indexing requests** with “Indexing requested / URL was added to a priority crawl queue.” The Cyberjaya fee-page request was rejected with “Quota Exceeded” and instructions to try again tomorrow. An ALFA details request already in progress completed successfully after that notice. No further requests were started after the limit was observed.

| University | Fee page recrawl | Details page recrawl |
| --- | --- | --- |
| BAC | Not requested after quota limit | Accepted |
| ALFA | Accepted | Accepted |
| INTI | Accepted | Accepted |
| CityU | Not requested after quota limit | Accepted |
| University of Cyberjaya | Quota exceeded; not accepted | Accepted |
| SEGi | Not requested after quota limit | Accepted |
| Taylor's | Accepted | Not requested after quota limit |
| APU | Accepted | Accepted |
| UniKL | Not requested after quota limit | Accepted |
| UCSI | Not requested after quota limit | Not requested after quota limit |

All twenty URLs are present in the submitted sitemap. The remaining eight optional direct recrawl requests are: BAC fees, CityU fees, Cyberjaya fees, SEGi fees, Taylor's details, UniKL fees, UCSI fees and UCSI details. Resume these when Google permits; no background job or future submission was scheduled. Do not repeat the twelve accepted requests simply to increase priority.

Acceptance into a crawl queue is not confirmation that Google has recrawled the updated page, changed its snippet or improved its ranking. Check crawl dates and title/content retrieval on a later visit, and compare a complete post-deployment 28-day period with the recorded baseline while retaining country, URL and device segmentation.
