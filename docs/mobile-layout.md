# Mobile layout update — 22 September 2026

## Changes

`assets/css/mobile.css` provides shared phone layouts and is linked after page-specific styles in 92 public HTML pages. The student-guide generator also includes it, so article regeneration preserves the changes.

- Solid, compact navigation with 44px menu controls, bounded scrollable menu, correct initial expanded state, and Escape-to-close with focus restored.
- Shorter homepage and university heroes, compact homepage statistics, readable heading sizes and better content clearance below the fixed header.
- Consistent gutters, section spacing, card padding, image ratios and single-column layouts where required.
- University tabs fit a phone row; gallery images form two columns and switch to one on very narrow phones.
- Article cards, table containers, topic directory, FAQs and in-article buttons remain readable on phones.
- Application and contact forms use 16px input text and large controls; contact details wrap instead of overflowing.
- Country layout grid children can shrink; an unclosed country CSS media block was repaired so tablet breakpoints work as intended.
- Reduced-motion preferences are respected; table data remains horizontally scrollable within its container instead of being hidden or compressed.

Existing content and fee data were not rewritten for this layout task. Desktop styles are preserved except for the repaired country breakpoint and reduced-motion handling.

## Validation

`node tests/mobile_layout_test.js` passed 351 assertions:

- 13 representative journeys at 320, 390, 430, 768 and 1440px.
- All 92 public HTML pages checked for document overflow at 390px.
- Mobile menu opening, Escape closing and focus restoration.
- University tabs, expanded fee categories, fee search, populated university comparison and application input sizes.

`node tests/article_seo_test.js` passed 146 assertions. `node scripts/build_site_seo.js --check` reports zero outdated files. Navbar JavaScript syntax check passed.

Screenshots are in `.codex-preview/mobile-final/`; homepage, university and application phone layouts were visually reviewed. The automated suite uses Chromium, reduced motion and blocks third-party requests for deterministic checks; remote fonts/icons/stock imagery are not validated by that suite. Form submissions, authentication and real-device Safari keyboard behaviour were not exercised. No live forms were submitted.

## Deployment

These changes are local. Deploy the updated public HTML pages together with `assets/css/mobile.css`, `assets/css/country-details.css` and `assets/js/navbar.js`. Keep the updated `scripts/student_guides.js` and test in the source repository. The shared stylesheet must be uploaded before or with the pages that reference it.
