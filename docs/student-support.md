# Student support section

Source: `scripts/student_support.js`, rendered by `scripts/build_site_seo.js`.

The new `/student-support-malaysia` page covers airport pickup, accommodation assistance, clinic visits, passport submission/enrolment/registration, job-search guidance and ongoing help. Service descriptions come from the site owner. No price, airport coverage, contact hours, booking lead time or guaranteed job is invented; visitors are asked to confirm their arrangements.

The homepage has a concise five-step timeline after the application process. Navigation and footer links lead to the full page. Application, all university profiles and both visa guides have a support callout. Existing Taylor's accommodation and library images are explicitly captioned as university facilities, not documentary photos of One-Step services.

Official EMGS and Immigration links support the screening and work-eligibility guidance. Work advice deliberately asks students to confirm their individual permission rather than promising employment or unrestricted work. The linked official English guidance was checked on 22 September 2026.

Validation: 30 page/viewport combinations at 320, 390, 768, 900, 1024 and 1440px passed, with image decoding and FAQ interaction checks. Article SEO tests passed 146 assertions. SEO build is reproducible with zero outdated outputs. Screenshots were inspected for the homepage phone timeline and full desktop support page. Third-party requests are blocked in automated previews. No contact form was submitted.

Run `node tests/student_support_test.cjs` to repeat the focused browser checks.

Deploy `student-support-malaysia.html`, `assets/css/student-support.css`, `assets/js/navbar.js`, `assets/js/footer.js`, `index.html`, `application.html`, updated university profile HTML, the two visa guide HTML files and `sitemap.xml`. Preserve the previously deployed mobile stylesheet and guide photographs. Keep the generator changes in the source repository. This update has not been deployed by the assistant.
