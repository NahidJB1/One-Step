# Astra chatbot review

Initial chatbot review: 12 September 2026. Ranking follow-up: 13 September 2026, using sources verified on 12 September. The original `tests/CHATBOT_TEST_RESULTS-astra.txt` and `tests/data_of_emgs` are preserved.

The 81-question report was replayed with the intended story boundaries. Independent stress questions now start with empty context; only questions with an explicit `story` ID share context. Previously, every independent question shared story ID zero, which contaminated later answers.

## Changes tied to the report

| Report questions | Finding and resulting behavior |
| --- | --- |
| 4–5, 9–10, 19–22 | Noise does not inherit a fee request. Conversational words such as “maybe”, “even”, “every” and “single” are not program restrictions. A missing management match alongside engineering is stated explicitly. |
| 8, 73, 78, 80 | UM is recognized without confusing it with IUMW. Supported comparison institutions are answered even when another institution lacks a catalog. Q78 now compares verified QS World 2027 results for UM and Taylor's; UM hostel prices remain a data limitation. Explicit overview questions do not inherit ranking intent. |
| 11–14, 23–25 | Reviewed Banglish/Bengali phrases and university/program abbreviations are understood. Unsupported institutions remain data limitations. |
| 15–18, 28 | Live tracking links to EMGS. The local 32% explanation is distinguished from a live status check; pending documents do not imply automatic rejection. |
| 26–30, 52, 61–63, 67–71, 79 | Academic background is separated from the intended next degree. Gap/English/visa answers preserve conditions and do not promise admission or approval. Good-conduct and Graduate Pass nationality rules are scoped. |
| 32–33, 38–40, 46 | Vague acceptance does not retrieve payment methods. Identity, human contact, greetings with questions and farewells have appropriate responses. |
| 34–36 | Existing country guides are linked. Detailed structured comparisons for these countries remain unavailable. |
| 37, 42, 54–60, 65–66 | Complex funding questions receive separate course/fee, scholarship, visa and work guidance. Published totals can be ordered, annual amounts are looked up, and medical payments are distinguished from tuition. |
| 48–51, 53–55 | Selected universities/programs survive relevant follow-ups. New explicit topics clear stale filters. Broad program lists begin with undergraduate entries instead of arbitrarily leading with PhDs. |
| 64, 74–75 | Accreditation codes cannot turn bachelor's programs into master's programs. Invalid duration labels are suppressed. Matching UTM records without monetary values are described as unpriced, rather than rendered as fee answers. |
| 76–77, 81 | Funding and overseas transfers require current award/agreement details. The bot explains what is missing and points to the relevant local guidance. |

## EMGS knowledge

`data/emgs_source.txt` is byte-identical to the supplied source. Runtime reads reviewed structured summaries and tables from `data/emgs_knowledge.json`, plus counseling responses from `data/counselor_knowledge.json`. It does not read the tests folder or make network requests.

The structured data covers new-pass documents, passport pages and validity, nationality exceptions, NOC/LOE, health declarations, yellow fever, photos, personal bonds, English certificates, renewal, variation/progression, Sarawak conditions, SEV countries, Graduate Pass documents/eligibility/sponsors/dependents, refunds by fee component and the supplied institution EMGS fee estimates.

Official document/photo/Graduate Pass/refund references are attached to the answers. The official medical-screening and student-work references were also checked. Source links are references, not evidence of a live lookup during a chat.

Some supplied information conflicts or has important limits:

- EMGS's document checklist and detailed photo page give different print dimensions; the answer surfaces that conflict and links the official checker.
- The institution EMGS table is an estimate with unverified effective dates/inclusions. A conflicting Visa Fee in the tuition data is flagged, not silently replaced or added.
- China/India Graduate Pass conditions have a stored end date of 31 December 2026. The eligibility response flags a passed deadline instead of assuming an extension.
- The initial chatbot update preserved the original catalog/FAQ/fee JSON files. The ranking follow-up updates existing ranking FAQ answers without changing their IDs. Legacy data still contains issues requiring factual review, including conflicting fee/duration records and overly categorical claims outside the reviewed topics.

## Conversation memory and Hostinger

The widget posts only the current message and the returned compact context. It never sends the conversation transcript. Context contains validated university, level, subject and filter values, a few choice IDs, language and nationality where relevant. A source fingerprint invalidates stale state.

Context is capped at 4 KiB; oversized saved state resets with a clarification. Browser display history remains capped at 40 messages. There is no new server session store, conversation database, external AI API, model process or background worker.

The 500-turn SEGi MBA test retained the program while alternating total and first-year questions. Its largest JSON request was **253 bytes**. The widget test also sends 300 turns and verifies constant request size and capped local history. These are local measurements, not a production Hostinger load test.

## Verification

- **67 existing PHP checks passed**, preserving prior fee, budget, exclusion, pagination, scope and malformed-input behavior.
- **314 additional checks passed**, including all 81 report responses, meaningful response assertions, multilingual examples, source-pointer resolution and the 500-turn conversation.
- The HTTP suite checks the existing endpoint contract and additional ranking, scope-follow-up, Bengali and combined fee/ranking responses against an isolated local PHP server.
- Widget contract checks passed, including safe links/rendering, feedback-compatible response fields, nested paths, context persistence, blocked storage, network recovery and 300 turns.
- The additional PHP suite used **24 MiB peak memory** locally with PHP 8.4.25.
- The initial update's SHA-256 comparisons confirmed unchanged `api/chat.php`, widget CSS, `universities.json`, `myfaqs.json` and `data/fees_data.json`. The ranking follow-up changes `myfaqs.json` ranking answers and adds sourced ranking data; it does not modify the endpoint, widget or fee/catalog files. The initial widget JavaScript diff contains only removal of outgoing history. The tester HTML diff changes only story-state handling; its markup and styles are preserved.

The refreshed replay's status distribution is 51 answered, 7 clarification, 15 partial and 8 not-found. Status labels are routing metadata, **not accuracy percentages**. The eight not-found cases are noise/code inputs and missing TARC/UM catalog data. Partial replies include source limitations, live-status limitations and answers with a missing comparison component.

The computer-use connection was unavailable for the requested ranking research, so web research was used. The ranking follow-up includes local Chromium checks of all 29 detail pages and desktop/mobile ranking sections, plus comparisons of existing controls/scripts against the pre-update backup. No deployment to Hostinger was performed. See [ranking evidence and maintenance](university-rankings.md).

## Review the answers

- [Updated 81-answer text report](../tests/CHATBOT_TEST_RESULTS-astra-updated.txt)
- [Responses with context and sources](../tests/chatbot_astra_replay.json)
- [Running, deployment and maintenance instructions](chatbot.md)

Recreate the report with `php tests/chatbot_replay.php`. The local bot has broader reviewed coverage; it still needs reliable source data and realistic regression questions as new topics are added. These checks do not establish universal language understanding.
