# Search Console discrepancy investigation and deferred snippet evidence

Checked **6 October 2026** using the authenticated Search Console UI and fresh CSV downloads. No URL submissions, property settings or analytics settings changed. **No country/device performance claim is made.**

## What was ruled out

The original exact-ten export had Pages/Chart totals 65 clicks / 5,211 impressions for 6 September–3 October, while Devices summed to 18 clicks / 1,557 impressions. The device discrepancy was reproduced in the live UI under the same ten-page regex and date filters. It is not solely a CSV parser or arithmetic error.

Taylor's was then isolated to its one canonical fees page. Two independent exports were saved:

- [Anchored regex filter](gsc-taylors-regex-comparison/Filters.csv): `^https://www\.onestepmy\.com/Fees_Chart/taylors-fees$`.
- [Literal Exact URL filter](gsc-taylors-exact-comparison/Filters.csv): `https://www.onestepmy.com/Fees_Chart/taylors-fees`.

The date dialog was rechecked after exporting: **6 September–3 October 2026** versus **9 August–5 September 2026**, inclusive. Search type Web; all countries/devices; no query filter. The page filter identifies the clean HTTPS/www canonical, not an alias family.

| Taylor's current-period dimension | Regex export | Exact URL export |
| --- | --- | --- |
| Pages, one row | 6 clicks / 1,842 impressions | 6 / 1,842 |
| Queries, 283 rows | 0 clicks / 477 impressions | 0 / 477 |
| Devices, 3 rows | 0 clicks / 477 impressions | 0 / 477 |
| Countries, 106 rows | 0 clicks / 477 impressions | 0 / 477 |

The query CSV files are byte-identical. The live Exact URL device view also showed zero current-period clicks while its headline showed six. Thus changing regex to Exact URL did **not** resolve the difference. The three device rows are complete categories; the 1,000-row table cap does not explain their discrepancy by itself. The old country/device values must not be used as complete denominators or multiplied into page-level results.

## Explanation boundary

[Google's discrepancy documentation](https://support.google.com/webmasters/answer/17010575) distinguishes page/property aggregation, omitted anonymized query rows and truncation under filters. [Its data documentation](https://support.google.com/webmasters/answer/17011364) explains that daily reports use Pacific Time and have processing/completeness limits. These are plausible general contributors and explain why query tables need not total to page traffic. They do **not conclusively explain why this single-page device/country export has the same truncated-looking totals as the query table**.

**The underlying country/device discrepancy remains unresolved.** It was reproduced and isolated, not mathematically “fixed” by inventing missing values. The current implementation therefore withholds country/device traffic shares, CTR comparisons and conversion denominators. Do not label the unreported observations Bangladesh, mobile, branded or unbranded by assumption.

Next evidence to obtain: an authorized Search Analytics API extraction with fixed start/end dates, exact page filter and separately requested page/country/device/query dimensions, including response aggregation type; or Google-supported investigation with the saved report views/exports. No callable Search Console API connector was available in this task, and no support message was sent. A future extraction must compare like aggregation/filter definitions and reconcile against the UI before publishing performance claims.

## Page-filtered queries obtained

The [exact-page query CSV](gsc-taylors-exact-comparison/Queries.csv) is now available for the proposed Taylor's fees description experiment. Some confirmed current/previous query observations:

| Query on this exact page | Current clicks / impressions / position | Previous clicks / impressions / position |
| --- | --- | --- |
| taylor university tuition fees for international students | 0 / 61 / 8.43 | 1 / 90 / 7.37 |
| taylor university malaysia fees | 0 / 53 / 11.11 | 0 / 117 / 7.97 |
| taylor's university fees for international students | 0 / 33 / 8.06 | 0 / 37 / 8.41 |
| taylor's university postgraduate fees | 0 / 24 / 8.12 | 0 / 28 / 6.18 |
| taylor university computer science fees | See saved row | See saved row |

These are actual page-filtered rows, not university-name assumptions assigned from the ten-page marginal export. They show financial intent and changes in exposure/position. They do not establish the distribution of the page's six current-period clicks or justify an immediate title/description rewrite.

**Initial release:** current title and description preserved. **Later experiment:** refresh exact-page queries and complete dates at the actual deployment baseline; annotate a separate description-only release, inspect Google's displayed snippet, and compare comparable query/country/device/position cohorts only after the discrepancy is resolved. If data remains sparse or mixtures differ, extend the observation period and report the result as inconclusive. No experiment was implemented or deployed here.
