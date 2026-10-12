# Search baseline for the five institutions

Research started 5 October; Search Console exports captured **6 October 2026**, Asia/Kuala_Lumpur. Search type: Web. Scope: the exact ten HTTPS/www/clean canonical URLs, unless explicitly labelled otherwise. No indexing requests or property settings were changed.

## Evidence and dates

- [Three-month raw export](gsc-exact10-three-months/Filters.csv): **4 July–3 October 2026**, with Pages, Queries, Countries, Devices, Search appearance and daily Chart CSVs.
- [28-day comparison raw export](gsc-exact10-28day-comparison/Filters.csv): **6 September–3 October** versus **9 August–5 September 2026**, inclusive. These dates were verified in Search Console's date dialog on 6 October; the exported Filters file itself says “Last 28 days”.
- [Machine-readable calculations](baseline-evidence.json), reproducible with `node docs/seo-research-2026-10-05-five-institutions/analyse-baseline.cjs`.
- Original sitewide three-month export: `../../onestepmy.com-Performance-on-Search-2026-10-05/`. It covers the same dates and is used only for historical URL-family reconciliation.
- Historical pre-deployment record: [26 September report](../search-console-2026-09-26.md), covering 28 August–24 September. Its 20-page aggregate is **not** the current ten-page aggregate.

The exact-page filter is:

```text
^https://www\.onestepmy\.com/(Fees_Chart/(alfa|taylors|segi|cityu|inti)-fees|Universities/(alfa|taylors|segi|cityu|inti)-details)$
```

## Aggregate result

| Scope | Clicks | Impressions | CTR | Average position |
| --- | ---: | ---: | ---: | ---: |
| Exact ten, 4 July–3 October | 165 | 11,779 | 1.40% | 8.3 displayed |
| Exact ten, 6 September–3 October | 65 | 5,211 | 1.25% | 8.1 displayed |
| Exact ten, 9 August–5 September | 84 | 5,418 | 1.55% | 8.2 displayed |
| Five fees pages, latest 28 days | 63 | 4,009 | 1.57% | 6.74 derived |
| Five fees pages, previous 28 days | 84 | 5,194 | 1.62% | 6.74 derived |
| Five details pages, latest 28 days | 2 | 1,202 | 0.17% | 12.67 derived |
| Five details pages, previous 28 days | 0 | 224 | 0% | 42.70 derived |

CTR is calculated from summed clicks/impressions. “Derived” position is weighted by impressions from rounded exported page values, not a separately measured Google ranking. Do not average page CTRs or positions without weights.

The five details pages gained recorded exposure; fee-page clicks declined. The combined CTR also changes because more impressions now belong to lower-CTR details pages. A single sitewide CTR target would conceal that difference. Taylor's fees lost 16 clicks and 1,613 impressions, ALFA fees lost 11 clicks, while CityU and INTI fees gained recorded clicks. Investigate those separately.

**No causal effect is established.** September's documented deployment was 26 September. The current window contains only eight post-deployment days. The daily exact-ten chart reports 6 clicks / 1,110 impressions for 26 September–3 October, but this short mixed-intake sample is not a controlled before/after test. Canonical attribution, crawling dates, seasonality, query/device mix and position also matter. Do not claim either success or harm from the September work yet.

## Each exact canonical page

All paths below use `https://www.onestepmy.com`. C/I = clicks/impressions. Current/previous refer to the two complete 28-day periods above. Three-month figures are for the exact canonical row, not a sum of variants.

| Canonical path | Current C/I | Current CTR / position | Previous C/I | Previous CTR / position | Three-month C/I |
| --- | ---: | --- | ---: | --- | ---: |
| `/Fees_Chart/alfa-fees` | 41 / 1,250 | 3.28% / 5.08 | 52 / 1,470 | 3.54% / 5.47 | 105 / 2,961 |
| `/Universities/alfa-details` | 1 / 288 | 0.35% / 9.40 | 0 / 17 | 0% / 21.59 | 1 / 305 |
| `/Fees_Chart/taylors-fees` | 6 / 1,842 | 0.33% / 7.61 | 22 / 3,455 | 0.64% / 6.99 | 32 / 6,204 |
| `/Universities/taylors-details` | 0 / 50 | 0% / 27.50 | 0 / 15 | 0% / 70.80 | 0 / 65 |
| `/Fees_Chart/segi-fees` | 7 / 385 | 1.82% / 7.78 | 9 / 199 | 4.52% / 10.91 | 16 / 584 |
| `/Universities/segi-details` | 0 / 149 | 0% / 14.20 | 0 / 51 | 0% / 40.14 | 0 / 201 |
| `/Fees_Chart/cityu-fees` | 6 / 184 | 3.26% / 6.97 | 1 / 66 | 1.52% / 7.67 | 7 / 250 |
| `/Universities/cityu-details` | 1 / 517 | 0.19% / 12.57 | 0 / 72 | 0% / 43.18 | 1 / 589 |
| `/Fees_Chart/inti-fees` | 3 / 348 | 0.86% / 6.78 | 0 / 4 | 0% / 31.25 | 3 / 352 |
| `/Universities/inti-details` | 0 / 198 | 0% / 12.77 | 0 / 69 | 0% / 43.19 | 0 / 268 |

These are returned rows. A zero-click row still has demand/exposure; an absent row elsewhere is not proof of zero demand or non-indexing. None of the table's average positions is an exact ranking for one query, market or device.

## Historical variants: separate analytical view

The sitewide 5 October export contains **30 rows** matching these ten URL families after grouping www/non-www, literal repeated slashes, `.html` and the intentional `city-university` → `cityu` alias. Their combined exported page-row totals are **269 clicks / 15,304 impressions** for 4 July–3 October. This includes the canonical rows; do not add 269 to 165.

| Page family | Exact canonical C/I | Family C/I including legacy rows |
| --- | ---: | ---: |
| ALFA fees | 105 / 2,961 | 174 / 4,209 |
| ALFA details | 1 / 305 | 1 / 363 |
| Taylor's fees | 32 / 6,204 | 37 / 7,254 |
| Taylor's details | 0 / 65 | 0 / 71 |
| SEGi fees | 16 / 584 | 30 / 993 |
| SEGi details | 0 / 201 | 0 / 213 |
| CityU fees | 7 / 250 | 18 / 544 |
| CityU details | 1 / 589 | 1 / 600 |
| INTI fees | 3 / 352 | 8 / 717 |
| INTI details | 0 / 268 | 0 / 340 |

This historical distribution is **not evidence that every variant remains indexed today**, nor proof of an ongoing ranking penalty. Ten `.html` aliases currently 301 to their clean canonicals. Duplicate-slash requests were a distinct live defect on 5 October. Current URL Inspection and daily family-level reporting should distinguish historical attribution from continuing duplication. A comparable 28-day family export remains outstanding; do not present clean-only growth as total family growth.

## University searches versus One-Step brand

Classification rule: explicit `One-Step`, `one step`, `onestep` or `onestepmy` → One-Step brand; institution names → university search; ambiguous `alpha`, generic `City University`, short fragments and unrelated terms require review. University-name searches are branded for the institution but **not** One-Step brand searches. Keep mixed brand+university queries in a separate subsegment if they appear.

No explicit One-Step-brand query appeared among the **577 returned exact-ten three-month query rows**. This is not proof there were none: query reporting is incomplete. Their 48 returned clicks do not explain all 165 page clicks. Do not assign the unreported 117 clicks to any institution/query, or infer a brand share from that gap.

Observed query-cluster totals below are from the returned query rows only, not keyword search volumes or complete page traffic:

| Cluster | Rows | Clicks | Impressions | Interpretation |
| --- | ---: | ---: | ---: | --- |
| ALFA, exact spelling | 27 | 37 | 750 | Fee-period/payment queries are established candidates |
| Taylor's | 135 | 8 | 1,558 | Most visible candidate fee opportunity; competition and position matter |
| SEGi | 36 | 1 | 178 | Sparse fee/medical/ranking candidates; avoid broad forecasts |
| City University candidates | 41 | 0 | 365 | Ranking/identity queries; manually exclude other City institutions |
| INTI | 35 | 0 | 192 | Ranking and campus-fee candidates; exact-page mapping needed |
| Other/ambiguous | 303 | 2 | 445 | Do not turn incidental fragments into target keywords |

Examples for the latest 28 days, across the filtered ten-page set:

| Query | Current clicks / impressions / position | Previous clicks / impressions / position | Decision |
| --- | --- | --- | --- |
| alfa university college fees | 5 / 126 / 4.26 | 11 / 171 / 3.91 | Preserve strong fee intent; investigate exposure/query mix before rewriting title |
| alfa university college fees per semester | 4 / 42 / 3.55 | 1 / 56 / 3.89 | Answer fee period accurately; do not invent semester figures from annual columns |
| taylor university tuition fees for international students | 0 / 61 / 8.43 | 1 / 90 / 7.37 | Exposure and position worsened; a meta-description experiment alone cannot explain/fix this |
| taylor university malaysia fees | 0 / 53 / 11.11 | 0 / 117 / 7.97 | Relevance/competition and demand mix need examination alongside snippet |
| city university malaysia qs ranking | 0 / 73 / 8.52 | 0 / 0 / unavailable | Preserve Asia-versus-World distinction; new reported exposure, not a reason to invent a World rank |
| segi university ranking | 0 / 20 / 12.20 | 0 / 5 / 29.80 | Sparse, directionally improved visibility; insufficient evidence of CTR defect |

The exports do not jointly connect each query to a specific page. Names suggest hypotheses, but the table above does not establish whether the fees or details page earned a particular query impression. Obtain page-filtered query exports for any title test or cannibalization decision.

## Audience, device and reporting limitations

Existing copy explicitly targets Bangladesh. The owner has been asked whether that remains the priority; no answer has been recorded. Preserve that positioning provisionally and do not approve geographic expansion, translations or Bangladesh-specific admission claims by inference.

The exact-ten Country comparison reports Bangladesh **6 clicks / 315 impressions / 1.90% CTR / 9.16 position**, versus **3 / 242 / 1.24% / 8.24**. The same headline totals were confirmed in the Bangladesh-filtered UI on 6 October. Malaysia's returned country row is 5 / 285 versus 2 / 206. These volumes are too small to choose the business's target country. A separate Bangladesh export failed when the browser connection ended; the successful all-country export retains these country rows, but no new Bangladesh page cross-tab was saved.

Returned Device rows for the latest/previous periods: Mobile 9/949 versus 15/1,046; Desktop 8/592 versus 7/507; Tablet 1/16 versus 1/28 (clicks/impressions). **Device rows sum to 18 clicks, while the Pages/Chart total is 65.** The analogous three-month device total is 48 versus 165. Country/query totals are also partial. Search Console displayed its partial-filtered-data warning. The exact reason for this discrepancy has not been established; no mobile-share, country-share or full-traffic conversion denominator is derived from these tables. Re-export each dimension with fixed filters/API access before a segmented performance claim. [Google's reporting guidance](https://support.google.com/webmasters/answer/7576553) explains aggregation differences and partial reporting generally; it does not diagnose this particular export.

No GA4/GTM/other analytics tag or lead-event code was identified in the ten HTML pages and relevant runtime source. No analytics account or CRM dataset was available to establish completed enquiries or qualified leads. The contact form currently does not submit. WhatsApp/email links exist, but outbound clicks and messages received are distinct events. Enquiry counts, qualification rates, conversion rates and revenue impact are **unknown**.

## What to collect before deployment

Freeze new exact-ten and family-level daily/page/query/country/device exports for the last complete 28 days and preceding 28; keep this three-month file unchanged as dated evidence. Export query-by-page views for priority tests, an updated Bangladesh per-page view if that audience is confirmed, and preferably six months/previous-year intake context where available. Resolve marginal-table discrepancies rather than joining them by assumption. Refresh URL Inspection's index/canonical/crawl date for all ten before any submission. Do not repeat September's accepted indexing requests automatically.
