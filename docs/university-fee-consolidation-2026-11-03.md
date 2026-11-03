# University fee consolidation — 2026-11-03

Local changes only; no upload or live verification performed.

- All 26 universities own their complete fee charts under `/Universities/{id}-university#courses-fees`.
- Moved only the search control, chart markup (including its original notes and document controls), and existing download controls. No fee-page introduction, summary or FAQ was imported.
- Removed 26 active `Fees_Chart/*-fees.html` files. Historical release snapshots under docs were retained as evidence, not active pages.
- Exact original HTML for 257 tables is verified by `node tests/merged_fee_tables_test.cjs`, using pre-move SHA-256 hashes.
- Chart fragments in `data/university_fees/` are build inputs, not standalone public pages. Ownership analysis now retains university ownership on future regeneration.
- Updated redirects, internal links, sitemap, generator and FAQ disclosure styling.
- Taylor's has no stored PDF or working source download link, so no replacement document was invented.

Validation: combined page generator check; SEO generator check; 26 combined page preservation checks; exact table hashes; course-card extraction; accommodation checks; 146 article SEO checks; CityU mobile search and FAQ interaction.
