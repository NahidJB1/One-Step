# Scope A implementation and verification

**6 October 2026. Local implementation complete; not deployed.** Exactly the ten approved university/fees pages were generated. Scope B is a proposal only, fee numbers remain unchanged, and Taylor's description experiment is separate/deferred. The previously prepared runtime URL patch and `.htaccess` were untouched.

## Files changed by this implementation

| Files | Exact change and SEO/usefulness reason |
| --- | --- |
| `data/university_seo_content.json` | Five institution records gain honest fee-provenance fields, directly verified programme references, primary-source links and targeted identity/fee-reading wording. Metadata and Bangladesh-entry fields are unchanged; the other five editorial records are unchanged. |
| `scripts/university_seo_content.js` | Optional provenance/verified-programme renderers apply only where the new fields exist. The source-status note appears once per fees page; section labels sit beside each table. Details receive a source-linked programme table and specific fee anchors; fees link to paired `#courses-intakes`. INTI has an optional umbrella H1. New tables use a minimum readable width within the existing keyboard-focusable scroll container. Other institution output is unchanged. |
| `scripts/build_site_seo.js` | Passes public institution ID to the section-source renderer. Adds `--universities=...` to limit which final files are checked/written using the same full renderer, preserving excluded authored work. Default full-site behaviour remains unchanged. |
| `Fees_Chart/alfa-fees.html` | Unconfirmed edition/applicability, resource/annual-versus-semester reading and initial-charge interpretation; source labels in all six sections. |
| `Fees_Chart/taylors-fees.html` | Distinguishes University/College attribution, stored totals versus current issuer schedules and payment/tax scope. Foundation/diploma provider attribution is explicitly unconfirmed; labels in five sections. |
| `Fees_Chart/segi-fees.html` | University versus College/online applicability and registration/annual exclusions; unconfirmed foundation/language-provider attribution and edition; labels in four sections. |
| `Fees_Chart/cityu-fees.html` | Retains the stored Jan–Dec 2026 validity as an edition claim requiring applicability confirmation; preserves conditional scholarship/payment/tax labels and `cityu` mapping; labels in four sections. |
| `Fees_Chart/inti-fees.html` | Separates Nilai University, Subang and Penang Colleges, total tuition versus payment stages and current approximation uncertainty; labels in three sections. |
| `Universities/alfa-details.html` | Corrects copied Taylor's map to the official ALFA address query, replaces unsupported promotional/affiliation/mentorship assertions and adds the official Diploma Business reference with a diploma-fee link. |
| `Universities/taylors-details.html` | Replaces fee-derived generic examples with the directly verified CS programme reference, dated programme-information scope and University/College distinction; links to bachelor fees. Its correct map is unchanged. |
| `Universities/segi-details.html` | Corrects copied Taylor's map, Kota Damansara/Selangor/address wording and unsupported transport certainty; adds the exact MQR Cyber Security reference without conflating it with a generic/ODL title or fee row. |
| `Universities/cityu-details.html` | Uses official addresses/map query and regional-centre naming; adds MBA's programme/location reference with the postgraduate-fee anchor. |
| `Universities/inti-details.html` | Clarifies University versus Colleges in H1/intro, replaces unsupported “widest range” wording, corrects copied Taylor's map to Nilai and adds three campus-specific Diploma CS reference/fee links. |
| `tests/seo_preserved_controls.json` | Updates only the four approved map expectations. All other control values are preserved. |
| `tests/seo_pages_test.js` | Adds optional `SEO_PAGE_IDS` scoping so the ten-page release can be checked without overwriting or silently excusing excluded pages. Default full-site assertions remain intact. |

Research/review artifacts are in this directory: [source review](source-review.md), [fee reconciliation](fee-reconciliation.md), [116-row ledger](fee-reconciliation-ledger.csv), [scope B proposal](scope-b-contact-proposal.md), [GSC reconciliation investigation](search-console-reconciliation.md), raw exports/source snapshots, validation scripts/evidence and screenshots.

## Preservation and full generated-diff review

A before-change snapshot and SHA-256 manifest were captured outside the repository before edits. [Full scope diff](full-scope-a.diff) includes the ten HTML outputs, editorial data, two generators and two test files. [Page-only diff](generated-pages.diff) covers all ten generated pages. Diff review found no title, description, canonical, fee-cell, fee-note, ranking-block, runtime-script or stylesheet change beyond the authorized content/identity work. New page data is statically present in initial HTML.

Verified unchanged against that snapshot:

- All ten page titles, descriptions and canonical tags.
- `data/fees_data.json` and `data/university_rankings.json` byte for byte; all rendered fee cells/headers are checked against the unchanged data (300 rows across the ten-page scope's five fee tables).
- Five details pages' ranking content/metadata blocks, ranking dates and entity attribution.
- Bangladesh-specific entry-planning fields, existing metadata positioning and non-target editorial records.
- `sitemap.xml`, `.htaccess`, shared fee JavaScript and all six runtime URL-patch JavaScript assets.
- Images, stylesheets, PDF assets and unrelated page output from the scoped build.

Four map URLs changed: ALFA/SEGi/INTI contained the same Taylor's Lakeside destination; CityU had a hand-built identifier. They now use primary-source institution/address queries with accessible iframe titles, retaining existing iframe dimensions/lazy loading. Final hosted geocoding/rendering remains a third-party verification step, not a claim from the local mock environment.

The visual review caught squeezed mobile table columns that document-overflow assertions did not detect. The new programme tables were adjusted inside the existing horizontal-scroll container; actual last-column reachability and fresh mobile screenshots were then checked. Two shell-damaged apostrophes in the new Taylor's labels were corrected. Neither correction changed amounts or metadata.

## Checks and results

| Check | Result / scope |
| --- | --- |
| Scoped SEO generator check | `node scripts/build_site_seo.js --universities=alfa,taylors,segi,cityu,inti --check`: **0 outdated target files** |
| Source/crawlability/fee-interaction suite | `SEO_PAGE_IDS=alfa,taylors,segi,cityu,inti node tests/seo_pages_test.js`: **380 checks passed**, ten pages, 89-entry sitemap. Includes every source cell, internal destinations/fragments, canonical/schema checks, fee filters, repeated anchors after filtering/collapsing, downloads and JavaScript enhancement. |
| Responsive intent layout | `node tests/university_seo_layout_test.js`: **240 checks passed**, 20 pages at 320/390/768/1440px; shared renderer did not regress other priority pairs. |
| Scoped preservation/visual assertions | `node docs/seo-implementation-2026-10-06-five-institutions/verify-scope.cjs`: **241 checks passed**, protected source hashes, metadata/ranking blocks, non-target records/controls, source labels, mobile table-scroll reachability and 20 screenshots at 390/1024px. |
| Ranking generator | `php scripts/build_university_rankings.php --check`: **0 outdated ranking files** |
| Ranking browser checks | Five selected profiles passed **18 checks**, including static/schema/FAQ/tabs and existing ranking layout checks. The original runner hit a Node/Undici HTTP parser assertion during its local readiness request. A native `node:http` readiness substitute passed without changing the ranking assertions or production files; the documented wrapper is `run-ranking-check.cjs`. |
| Default full-site SEO checks | **Not clean because of preserved concurrent/excluded work**, described below; not reported as a scope-A pass. |

The 380-check suite was rerun after the final wording/table changes. Generated checks are local-server checks, not native Hostinger rewrite, live deployment, Google indexing, enquiry-delivery or traffic-improvement proof. No form was submitted; external requests were blocked for the isolated visual/preservation checks. Google Maps service behaviour was not certified there.

## Excluded concurrent work

During this run, `contact.html` changed its canonical from `https://www.onestepmy.com/contact` to `https://nahidjahanbhuiyan.com/`. The owner explicitly instructed **“Leave that edit untouched.”** It was preserved. Twelve article files and `scripts/student_guides.js` also changed outside these implementation commands; their changes are retained and recorded in [validation evidence](validation-evidence.json).

The default full-site test fails at the contact canonical assertion. The full generator's read-only check reports 13 outdated outputs: contact plus twelve articles. Scope A does not repair or overwrite them. The scoped generator check is clean for all ten approved pages. The full-site failures must be resolved by the owner of those excluded changes before claiming overall site readiness.

## Remaining evidence gaps and pending decisions

1. **Fee source-to-row review:** the 116-row ledger covers all Taylor's/INTI stored rows; two Taylor's and three INTI rows have direct numerical comparison evidence, including visual Taylor's PDF checks. **111 exact source reconciliations remain pending.** No current-intake total or numeric replacement is approved. ALFA/SEGi editions and CityU offer applicability also remain issuer-confirmation tasks.
2. **Search Console discrepancy:** new Taylor's single-page queries were obtained, but both literal and regex filters reproduce the Pages versus country/device discrepancy in the live UI and CSVs. Its exact cause remains unresolved; no country/device performance claims or denominator-based lead claims are made. API/Google-supported evidence is the next step; no support message was sent.
3. **Description experiment:** current descriptions were preserved. Taylor's page-query exports support a later separately annotated assessment, not a bundled experiment in this release.
4. **Scope B:** both minimal honest WhatsApp handoff and durable server-confirmed submission are documented, including delivery ownership and success/failure tests. Neither was implemented. The existing broken form remains an enquiry dependency until the owner chooses and authorizes a repair.
5. **Production:** deployment, live recrawl/Google-selected-canonical verification, hosted map rendering, Search Console submissions and the separate runtime URL-patch release remain excluded. No claim of improved traffic, rankings or enquiries is made from local tests.

Scope A is ready for local review with the above limits. It does not authorize deployment or resolve the excluded site's contact/article canonical state.
