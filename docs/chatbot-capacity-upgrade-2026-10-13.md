# Chatbot capacity upgrade — 13 October 2026

## Implemented

- The existing PHP retrieval engine, language handling, ranking rules, fee safeguards and response contract remain in use. No external AI service was introduced.
- A compiled JSON knowledge snapshot and FAQ index avoid reconstructing both for every request. Source-content hashes include the engine, active university pages and knowledge datasets. Missing, changed or malformed snapshots fall back to source loading; the web request never writes a cache.
- Extractive reference lookup reads the full article paragraphs and published About paragraphs. Campus answers retain section links. Course-campus answers use the catalog's recorded campus fields and interleave campus examples.
- Property lookup answers recorded amenities, travel estimates and lowest comparable monthly rents. It retains a validated property selection across follow-ups and clears it when the university changes. Missing utility, sharing and deposit details produce partial replies rather than assumed facts. Unknown rental periods are not compared as monthly rents; implausible travel estimates are not repeated.
- Explicit combined site questions are processed separately before topic shortcuts. Application and accommodation links are both retained. Existing immigration/nationality guidance keeps precedence for its existing multi-part messages.
- Intake months and years are recognized and retained. Stored prices do not confirm availability or applicability to a requested intake. Available schedule-validity labels are attached to sources and shown without presenting them as freshly verified facts.
- Study-mode words do not become course subjects. Explicit ODL is searchable; related ODL courses do not establish confirmed online mode.
- All-inclusive registration follow-ups preserve the existing course filters and separate fee notes without adding potentially overlapping charges.
- Ambiguous FAQ aliases no longer override an exact primary question. Different answers to the same primary wording still require clarification.

## Source review

The structural review found 13 question-variant groups with different answers within one university scope. Several map a broad “known for” variation onto both a majors question and an institutional identity question. Primary-question precedence resolves that matching ambiguity without deleting question variants or altering factual answers. Cross-university wording overlaps are not automatically treated as contradictions.

The source data still contains items requiring factual review, including promotional claims and unspecified fee periods. This upgrade does not invent verification dates, room availability, admission guarantees, updated rankings, or combined payable totals.

## Build and deployment

After updating knowledge, engine code or generated university pages:

```powershell
php scripts/build_chatbot_index.php
php scripts/build_chatbot_index.php --check
php tests/chatbot_capacity_test.php
```

Upload the changed `api/chatbot/` files and `data/chatbot_index.json` together with the current reference datasets and university pages. The generated snapshot is about 5.5 MB and contains reference data only. If omitted or stale, the bot still works using its source-loading path.

Do not hand-edit the compiled JSON. Rebuild it. `npm run build:chatbot-index` and `npm run check:chatbot-index` provide the same commands.

## Verification

Capacity tests cover direct/cached data equality, index equality, reply equality, source invalidation, malformed-index fallback, property/campus lookups, combined questions, missing facts, ODL, intake handling and registration follow-ups. Existing behavior, multilingual, ranking, widget and 100-turn student-dialogue tests are retained.

Five fresh local CLI measurements of knowledge loading, engine initialization and an APU master-fee answer took 1.11–1.37 seconds before caching and 0.12–0.16 seconds after caching. These are core-engine measurements, not Hostinger HTTP latency, database-analytics latency or concurrent-load results. Measured peak memory rose from about 22 MiB to 32 MiB. Production performance remains to be measured after deployment.
