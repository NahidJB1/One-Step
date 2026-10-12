# Scope A local implementation — 6 October 2026

- [Implementation and validation report](implementation-report.md).
- [Primary-source review and publication limits](source-review.md).
- [Taylor's/INTI fee reconciliation for review](fee-reconciliation.md) and [116-row ledger](fee-reconciliation-ledger.csv).
- [Scope B contact proposal — not implemented](scope-b-contact-proposal.md).
- [Search Console investigation and deferred snippet evidence](search-console-reconciliation.md), with fresh regex/Exact URL exports under `gsc-taylors-*`.
- Full changes: `full-scope-a.diff`; page-only changes: `generated-pages.diff`; validation assertions/screenshots: `validation-evidence.json` and the 20 PNG files.

Scope A is local only. Deployment, Search Console submissions, the separate runtime URL patch and scope B were excluded. Fee numbers and the initial-release descriptions were preserved. External edits to contact/articles/student-guides observed during the work were retained.

Safe scoped generation:

```powershell
node scripts/build_site_seo.js --universities=alfa,taylors,segi,cityu,inti
node scripts/build_site_seo.js --universities=alfa,taylors,segi,cityu,inti --check
$env:SEO_PAGE_IDS='alfa,taylors,segi,cityu,inti'
node tests/seo_pages_test.js
```

The default generator/test scope remains the full site. The scoped options exist to preserve separately authored work during this release. No full-site write build should be used to overwrite the owner's excluded edits as part of scope A.
