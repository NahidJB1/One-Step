# Chatbot prelaunch review — 13 October 2026

Scope: local chatbot, current 26 university pages, useful links, question interpretation and reply quality. Production and application delivery were not tested.

## Implemented

- Fee buttons and fee-row sources now open the merged university page at `#courses-fees`.
- University links use the current extensionless `*-university` route.
- The widget translates older Details/Fees links to merged URLs, including saved conversations. Query strings and existing section anchors are preserved.
- External source links and document downloads retain their destinations.
- A regression check validates 52 university destinations and every program/fee source URL.
- Old budget-test expectations were refreshed against the current KLUST total. The previous expected RM32,760 is absent from current fee data; no fee data or budget logic was changed.

## Recommended changes, in priority order

1. **Recognize application requests separately from visa requests.** `How do I apply to APU?` currently offers student-visa FAQs. For a named university, provide `/apply?university=apu`; retain the selected course when known. Explain that submitting an enquiry does not confirm admission.
2. **Read the supplied accommodation data.** `INTI accommodation` currently offers loosely related FAQ choices. Use `data/university_accommodation.json`, answer with the available properties, rents and stated rental periods, and link to `#accommodation`. When data is unavailable, say so and offer WhatsApp without inventing options.
3. **Handle combined intents explicitly.** `INTI fees and accommodation` currently selects a general hidden-fees FAQ. Answer each topic separately, retaining the institution and asking for a course only for the fee portion.
4. **Make university-section links depend on the question.** Offer Courses for program searches, Rankings for ranking questions, Accommodation when available, and Apply for application requests. Currently the standard institution action is a Fees button regardless of topic.
5. **Synchronize the bot with published university FAQs and articles.** The knowledge loader reads `myfaqs.json`, the program catalog, fee data, rankings and guidance. It does not load the new article or accommodation datasets. Add reviewed page content with provenance and deduplication; avoid automatically treating every paragraph as a FAQ.
6. **Tighten ambiguous FAQ choices.** For an institution-specific question, prioritize its FAQs and relevant general guidance. Reject unrelated suggestions rather than displaying three low-quality choices.
7. **Shorten initial fee answers.** The MMU first-year computer-science probe returns multiple levels and repeats lengthy conditions for each result. Ask for level when needed, show a small initial selection, and summarize shared conditions once while preserving fee basis and exclusions.
8. **Review source-quality flags.** The structural audit found 18 conflicting question variants, 21 answers with categorical wording, 74 records without a reliable study level, and 614 fee rows without an explicit total/period label. These are review candidates, not proof that each record is incorrect. Preserve uncertainty until checked against sources.
9. **Keep unanswered-query logs outside publicly served files.** `api/chat.php` currently appends unmatched user messages to `api/unmatched_queries.log`. Store these privately, limit retained personal information and use a retention policy.

## Local validation

- Core behavior: 67 passed.
- Rankings and follow-up behavior: 357 passed.
- Extended multilingual/dialogue regressions: 314 passed.
- Widget contract: passed, including safe links, nested paths, storage and network failures.
- All 52 current university destinations and all program/fee source URLs: passed.
- Changed PHP syntax and scoped whitespace checks: passed.

## Reply improvements implemented after review

- Application requests now open the preselected Apply form. A uniquely recognized full course name is passed to the form too. Visa, Graduate Pass, scholarship and eligibility questions retain their existing guidance routes.
- Accommodation replies use the 12 supplied property datasets, preserve every listed rent and distinguish monthly rates from unspecified rental periods. Universities without listings receive an explicit availability-of-information message and counselor link.
- Fee/course and accommodation requests receive separate sections; fee clarifications retain the university, subject and fee period. Accommodation and ranking combinations retain both topics.
- Article requests use the published article title and introduction and link to the Articles tab. Missing articles are identified explicitly.
- Published university FAQs are imported with page provenance. Matching institution-specific legacy answers are superseded, while their question variants remain searchable. Contradictory answers within a scope still require clarification.
- Action buttons now follow the question: Courses, Rankings, Accommodation, Articles, Apply or Details.
- Weak FAQ suggestions require more meaningful term overlap. Exact university-specific matches take precedence over general matches when one institution is selected.
- Identical fee conditions appear once per university per response, with subsequent entries referencing those notes. Ambiguous first-year/annual requests ask for the study level.

Additional validation: 168 targeted page-reply assertions and all 100 simulated student turns passed, including 1,369 dialogue assertions. Existing core, ranking, multilingual and widget suites also pass. All work remains local. Source-policy review and private unanswered-query logging remain separate follow-up items.
