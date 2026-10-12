# Search Console coverage audit — 23 September 2026

Source: the three 22 September exports in `docs/seo_issue/` (Table.html and Metadata.html).

| Report | Exported URLs | Current live result |
| --- | ---: | --- |
| Not found (404) | 43 | All 43 reach HTTP 200 |
| Page with redirect | 168 | All 168 reach HTTP 200 |
| Alternate page with proper canonical tag | 39 | All 39 reach HTTP 200 |

These are HTTP checks, not confirmation that Google has recrawled or indexed each destination. The machine-readable audit records every original URL, redirect hop, final response, title and canonical where present. It captures the live site BEFORE this change.

## Change

`.htaccess` now evaluates 28 known historical aliases before hostname and extension normalization on the production domain. For 53 URLs in the exports, those mappings lead directly to the already verified final destination, retaining query parameters. Previously some requests took three redirects. Local preview behavior is retained through hostname guards and the existing fallback rules.

The 404 repairs were already deployed: no replacement content or blanket redirect to the homepage was introduced by this update. Existing HTTPS/www normalization, canonical tags and program query behavior remain in place. The excluded redirect and alternate URLs are not independent pages we want indexed.

## Validation

- Live HTTP audit: 250 of 250 report entries reached HTTP 200; no redirect loops or request errors.
- `node tests/coverage_redirects_test.cjs`: 28 redirect mappings and 53 report variants pass destination and local-file checks. This is a static rule test, not an Apache runtime test.
- `node scripts/build_site_seo.js --check`: zero outdated outputs.
- `node tests/article_seo_test.js`: 146 checks passed.

## Deployment and Search Console

1. Upload the updated root `.htaccess`, preserving unrelated hosting configuration. This is the only runtime file changed for this task.
2. Verify representative legacy URLs with redirects disabled: they should return one 301 to the existing canonical URL, followed by 200. Include `/Universities/help-university-details.html?program=true` on both www and non-www hosts.
3. In Search Console, open **Not found (404)** and select **Validate fix**. The live audit already shows those reported URLs repaired; validation depends on Google's next crawl.
4. Do not try to index the redirect sources or remove correct canonical tags to clear the other two reports. Inspect the final canonical URL if its indexing is in question. Expected exclusions may remain visible permanently.
5. Keep submitting the canonical sitemap at `https://www.onestepmy.com/sitemap.xml`.

Google's guidance: https://support.google.com/webmasters/answer/7440203

No production files were uploaded and no Search Console validation was submitted during this task. Neither HTTP 200 nor successful validation guarantees indexing or ranking.
