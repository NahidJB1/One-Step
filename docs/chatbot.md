# Local student counselor

The chatbot uses PHP and the existing local JSON files. It makes **no external AI, embedding, search, or model calls**. PHP hosting is required; static hosting alone cannot run `api/chat.php`.

This is an information retrieval system with a typed query parser and bounded conversation state. It is not an LLM and cannot understand arbitrary questions or guarantee correct answers from incomplete or incorrect source data. Reviewed English, Banglish and Bengali domain phrases support university, fee, program and EMGS questions. Common response templates and guidance cards have Bengali answers; original program names, fee labels/conditions and untranslated legacy FAQs retain their source wording. It is not a general machine translator.

## Run and verify

Use PHP 8.1 or newer. No Composer packages, database, extensions beyond standard PHP/JSON, model downloads, or API keys are required. Existing feedback buttons still use the project's separate `api/log_feedback.php` database endpoint.

```sh
php -S 127.0.0.1:8000 -t .
php tests/chatbot_test.php
php tests/chatbot_astra_test.php
php tests/chatbot_rankings_test.php
php tests/chatbot_5_students_simulation.php
php scripts/build_university_rankings.php --check
php tests/chatbot_replay.php
node tests/chatbot_frontend_test.js
node tests/chatbot_http_test.js
node tests/university_rankings_pages_test.js
php tests/chatbot_audit.php > chatbot-audit.json
```

Open `http://127.0.0.1:8000/index.html` to use the widget. The HTTP test starts and stops its own loopback server. If PHP is not on PATH, set `PHP_BINARY` for that Node test. The PHP development server is for local development, not production deployment.

For this update, include the entire `api/chatbot/` directory, `assets/js/chatbot.js`, `data/emgs_knowledge.json`, `data/counselor_knowledge.json`, `data/emgs_source.txt`, `data/university_rankings.json` and `myfaqs.json` when deploying to the existing PHP host. Include the updated university detail HTML, `assets/css/university-details.css` and sitemap for the ranking pages. The widget's styling and HTML were not changed. No new server service, session database, model, cron job or Composer installation is needed. Runtime reads the copies under `data/`; it does not require the `tests/` folder. Upload the updated `bot_tester.html` only if you use that development test page. This workspace update does not deploy to Hostinger.

## Behavior

- Whole-phrase university aliases support multiple institutions. Ordinary “help” is not interpreted as HELP University. Long, uniquely identifiable spelling errors can be corrected; short university acronyms are not fuzzy matched.
- BBA, MBA, IT, BoHM, CITYU, APU and BAC have explicit domain handling. Capitalised “IT” in “would IT cost” remains a pronoun. Bengali combining marks and digits are preserved/normalised, and unsupported Bengali program restrictions prompt clarification.
- FAQ questions and saved variations are indexed with BM25, query coverage, and match specificity. FAQ answers do not influence retrieval. Institution scope, numeric conditions, and important qualifiers constrain matches. Close alternatives prompt clarification. Conflicting exact answers are flagged instead of selected arbitrarily.
- Program searches use university, study level, subject groups, exclusions, student category, campus, and study mode. An unrecognized condition prompts clarification. A missing result is described as missing local data, not proof that a university does not offer a program.
- Missing degree levels can be recovered from an exactly matching fee-table program at the same institution. Accreditation codes are excluded from program indexing; an MBA fragment in a bachelor's accreditation code cannot make it a master's program. Invalid duration labels and fee rows without monetary amounts cannot become quotes.
- Fee tables are read by header names. Vertical charge tables stay intact. Program names determine study level before category labels. Local/international labels, yearly versus total amounts, campus differences, published discounts, and category remarks remain visible. There is no inferred exchange rate or invented total.
- MYR budget filtering requires an explicit amount and period. Only rows with an unambiguous matching MYR price and period qualify. An inclusive published total takes priority over tuition alone; first-year installments are not treated as a recurring annual cost. This intentionally excludes incomplete or incomparable rows; it is not a complete cheapest-university ranking.
- Explicit follow-ups retain relevant slots; independent questions start a new search. “What about SEGi?” switches institutions. “Show more” pages a single search. “Start over” clears state. Up to four question clauses can be answered in one message; some tightly coupled or implicit questions still need clarification.
- “Best university” requests ask for study criteria or produce a sourced shortlist. The bot retains candidate IDs until a name/number selects an institution. It does not invent an overall ranking. First-year and later-year follow-ups use the recorded year column; missing values are not zero and totals are not divided to fabricate annual fees.
- Explicit ranking questions use dated local QS World/Asia facts and Malaysia positions derived from the complete QS World country list. Ranking bands, ties, parent institutions, missing editions and subject-rank limitations remain explicit. Scope/university follow-ups retain compact context; an explicit overview or fee question can leave the ranking topic. See [ranking sources and maintenance](university-rankings.md).
- Reviewed guidance cards cover the supplied EMGS snapshot: documents, passport exceptions, renewal, English evidence, bond amounts, SEV countries, Graduate Pass restrictions, refund components and institution fee estimates. The conditions in the cards take priority over old FAQ wording. Nationality-only follow-ups can retain the guidance topic. Institution estimates and conflicting source values are labelled; they are not treated as universal government fees.
- Score-only personal eligibility questions ask for program and qualification details. The chatbot cannot access a student's application or check live EMGS status; tracking requests link to the existing official tracker.
- Answers include local source references. Retrieval `confidence` is a heuristic score, **not** a probability that a fact is correct or an admission/visa success rate.

Try:

```text
Hi, what are APU master fees?
What about SEGi?
City University MBA at Petaling Jaya fees
UCSI pharmacy bachelor fees
IIUM master business intelligence fees
Computer science bachelor programs under RM 60000 total
APU master fees not SEGi
Does SEGi offer scholarships?
Can I pay tuition at APU in installments?
APU master fees. What scholarships do they offer?
malaysia te best university kunta?
সিটি ইউনিভার্সিটি তে মাস্টারস পড়তে কেমন খরচ হবে?
CITYU BoHM fees
How much would it cost for one year?
Personal bond for Bangladesh
Graduate Pass documents
Refund of medical screening and insurance
```

## Files

| File | Responsibility |
| --- | --- |
| `api/chat.php` | HTTP validation, request limits, JSON responses and error handling |
| `api/chatbot/Lexicon.php` | Reviewed aliases, language normalization, levels and topic vocabulary |
| `api/chatbot/Text.php` | Unicode-safe normalization, tokenization and bounded spelling correction |
| `api/chatbot/Language.php` | Reviewed Bengali/Banglish phrases, numerals and response localisation |
| `api/chatbot/KnowledgeBase.php` | Local data loading, university identity and fee schema normalization |
| `api/chatbot/FaqIndex.php` | Scoped FAQ retrieval, specificity, source-condition checks and ambiguity handling |
| `api/chatbot/Query.php` | Typed search slots and explicit constraints |
| `api/chatbot/Guidance.php` | Concept applicability, nationality conditions and EMGS reference tables |
| `api/chatbot/Counselor.php` | Conversation state, routing, clarification and source-backed response formatting |
| `api/chatbot/Rankings.php` | Dated ranking facts, national positions, comparisons and shared page FAQs |
| `data/university_rankings.json` | Reviewed QS editions, sources, institution scope and complete Malaysia World population |
| `scripts/build_university_rankings.php` | Offline generation of ranking HTML, FAQ/SEO markup and existing FAQ answers |
| `assets/js/chatbot.js` | Context/history persistence, safe rendering, source links, suggestions and feedback |
| `tests/chatbot_audit.php` | Read-only content audit for conflicting variants and incomplete records |
| `data/emgs_source.txt` | Unchanged copy of the user-supplied EMGS source |
| `data/emgs_knowledge.json` | Reviewed EMGS summaries, applicability rules and reference tables |
| `data/counselor_knowledge.json` | Counseling responses and explicit limitations of the local information |
| `tests/chatbot_astra_test.php` | Report regressions, source checks, multilingual cases and 500-turn conversation test |
| `tests/chatbot_5_students_simulation.php` | Five isolated Bangladeshi student journeys with 20 sequential questions each, semantic assertions and compact-context checks |
| `tests/CHATBOT_5_STUDENTS_SIMULATION.md` | Human-readable questions, verbatim answers, sources, statuses and per-turn results from the latest simulation |
| `tests/chatbot_5_students_simulation.json` | Machine-readable form of the same 100-turn simulation |
| `tests/chatbot_replay.php` | Recreates the 81-answer report using the original story boundaries |

The optional `university_meta.json` provides descriptive locations and institution types. Unverified visa percentages and marketing rankings from that file are not used as outcomes or guarantees. University and fee page links are resolved from actual local files, including installations in a subdirectory.

## API

```json
{
  "message": "What about SEGi?",
  "context": {
    "version": 3,
    "universities": ["apu"],
    "levels": ["master"],
    "intent": "fees"
  }
}
```

Send the **entire returned `context`** with the next request. The production widget sends **only `message` and `context`**, with no conversation history. Context holds validated search slots, bounded candidate/FAQ IDs, language and nationality where applicable; it contains no answer text, passport numbers or transcript. Empty/redundant fields are removed. Context is limited to 4 KiB, and oversized saved state recovers with a clarification and reset. The widget retains at most 40 messages in browser storage for display.

A knowledge fingerprint invalidates stale state after source changes. For older clients only, the endpoint still accepts a small user-only history fallback; the updated widget does not use it. No chat messages are written to public unmatched-query logs. Context is client-managed and must never be trusted as factual knowledge.

The response retains `reply`, `context`, `isFallback`, `buttons`, `suggestions` and `matched_q`, with `status`, `sources`, `confidence`, and `engine` (`local-retrieval-v3`). Status is `answered`, `clarification`, `partial`, or `not_found`. `matched_q` identifies a single selected FAQ/guidance card; compound answers leave it empty to avoid attributing all feedback to one component. `isFallback` is true for every status other than `answered`.

Requests are limited to 32 KiB and 2,000 message characters. Invalid inputs return HTTP 400/413/422; unsupported methods return 405; unreadable or malformed required data returns 503. Production PHP errors go to the server error log, not to the response.

## Improving the knowledge

1. Add or correct factual answers in `myfaqs.json`. Variations must mean the same thing and preserve every condition in the original question. A Sarawak-only FAQ must not have the generic variation “visa requirements.”
   For reviewed EMGS/counseling topics, update the corresponding knowledge file instead: its cards take precedence over legacy FAQs. Each card names its source and applicability through `all`, optional `any`, `none` and phrase conditions. Review both positive and negative examples. Do not train facts automatically from chat messages.
2. Correct program names, levels, and durations in `universities.json`; avoid numeric row IDs in the `level` field. Keep fee currencies, periods, campus labels and conditions explicit in `data/fees_data.json`.
3. Run the audit and review flagged records against the original university/EMGS documents. The audit identifies structural concerns; it does not decide which conflicting answer is true.
4. Add realistic paraphrases and negative examples to `tests/chatbot_test.php` before changing retrieval thresholds. Include follow-up turns and unsupported questions, not just exact FAQ copies.
5. Rerun the PHP, HTTP, and widget tests. Review real user feedback through the existing admin workflow; do not automatically learn factual answers from user messages or likes.

The initial audit of this workspace found 1,078 FAQs, 4,062 normalized program/fee entries, 18 variations linked to different answers, 21 categorical claims requiring review, and 146 entries without a reliable study level. These counts describe the input data, not conversational accuracy. University/program and fee JSON data was preserved; the subsequent rankings update changes existing ranking FAQ answers without changing their IDs. Reviewed guidance carries source/check metadata, but this is not a live update feed or a guarantee that a rule/price remains current.

See [the Astra review](chatbot-astra-review.md) for the reported failures, verification and remaining data limitations. `tests/CHATBOT_TEST_RESULTS-astra-updated.txt` contains the replayed answers; `tests/chatbot_astra_replay.json` also includes state and source metadata.

The automated suite covers retrieval behavior, constraints, state, HTTP errors and widget integration. The ranking page suite adds local Chromium checks of static/structured content, native FAQs, existing tabs and responsive layout. Passing the suite does not establish “almost all questions” coverage; that requires an independently labeled collection of real student questions and ongoing measurement of wrong answers, useful clarifications and unanswered questions.
