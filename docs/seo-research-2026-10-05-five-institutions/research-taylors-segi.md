# Taylor's University and SEGi University: research and proposed scope

Research date: **5 October 2026**, Asia/Kuala_Lumpur. Phase 1 only. No website files, editorial data, live settings or submissions changed. Bangladesh remains the **provisional audience**, pending the owner's confirmation. Research used ordinary web search and direct source inspection. Search-provider location was not controlled; this is **not a Google Bangladesh ranking audit**. No measured keyword volumes were available.

## What is already implemented and live

Read `docs/seo-university-intent.md`, `docs/search-console-2026-09-26.md`, Taylor's/SEGi records in `data/university_seo_content.json`, and all four target source pages. Existing work already includes unique intent-specific metadata, self-canonicals, fee-period explanations, university/college distinctions, programme examples, conditional scholarship language, Bangladesh entry-planning guidance, official links, fee/details crosslinks and sourced ranking sections. Do not propose adding those generic elements again.

Direct Node HTTP fetches on 5 October returned **200** with the following self-canonicals. Their current titles matched the local editorial records:

| Page | Verified canonical | Current title |
| --- | --- | --- |
| Taylor's fees | https://www.onestepmy.com/Fees_Chart/taylors-fees | Taylor's University International Tuition Fees \| One-Step |
| Taylor's details | https://www.onestepmy.com/Universities/taylors-details | Taylor's University: Ranking, Courses & Intakes \| One-Step |
| SEGi fees | https://www.onestepmy.com/Fees_Chart/segi-fees | SEGi University Fees for International Students \| One-Step |
| SEGi details | https://www.onestepmy.com/Universities/segi-details | SEGi University: Ranking, Courses & Kota Damansara |

The search tool's cached fee-page extraction showed older generic wording, while direct live fetches contained the newer `Plan your ... study budget` content. A cached search result is not evidence of a failed deployment. Live comparison should use direct HTTP/rendered responses.

The dated Bangladesh baseline (28 August–24 September 2026; all devices) reports Taylor's fees **0 clicks / 83 impressions / position 8.7**, SEGi details **0 / 21 / 16.4**, and SEGi fees **0 / 6 / 28.2**. No Taylor's details row was reported. The query “taylor university tuition fees for international students” had **30 impressions, 0 clicks, position 8.8**. These are monitoring candidates, not proof of a snippet defect or zero demand. The September record says all 20 then-targeted pages were indexed, but does not establish their current Google-selected canonical or an effect from the September changes. Only nine calendar days have elapsed since the documented 26 September release.

## New, specific findings

### 1. Taylor's fee provenance needs programme-level reconciliation

Both local and direct live HTML display Bachelor of Computer Science (Hons), three years, **RM135,738 / USD31,567**, with no explicit intake edition on that row. The official selector now links a Computer Science international schedule whose course page is dated **14 August 2026**, for **September 2026**. It lists RM124,080 tuition, RM143,944 total without SST, and RM152,187 / USD40,049 in the with-SST total columns. Its instructions make RM the payment basis and USD an indicative reference. These differently scoped amounts must not be compared as a simple price increase or substituted blindly. The PDF's general note says fees are exclusive of SST while the table explicitly supplies with-SST columns; preserve those column labels and resolve any ambiguity in the university's written offer. [Official Computer Science schedule](https://university.taylors.edu.my/content/dam/taylorsrevamp/university/study/scholarships-and-financial-aid/fees-schedule/school-of-computer-science/undergraduate/taylors-fees-schedule-ug-computer-science-usd.pdf)

**Implication:** generic “confirm the schedule” prose has already been added, but cannot replace traceable row-level evidence. Recommend a controlled reconciliation of actual source documents before changing numbers, plus a visible schedule/edition/status field next to each qualification section. Do not label the entire page “2026 fees” on this evidence alone; a September 2026 schedule is also not an offer for the next available intake.

Taylor's official selector separates local MYR and international USD links by school. Taylor's College separately publishes foundation programme information and fee schedules. University and College attribution should be explicit on each foundation/diploma source section, rather than merely telling the student to investigate the distinction. [University fee selector](https://university.taylors.edu.my/en/study/scholarships-and-financial-aid/fees-schedules.html), [College Foundation in Business](https://college.taylors.edu.my/en/study/explore-all-programmes/school-of-pre-university-studies/foundation/foundation-in-business.html), [College international foundation schedule](https://college.taylors.edu.my/content/dam/taylorsrevamp/college/study/scholarship-and-financial-aid/fee-schedule/foundation/v13022026/tc-fees-usd-foundation-13022026.pdf)

### 2. SEGi's live map identifies Taylor's, not SEGi

`Universities/segi-details.html` around line 144 embeds a Google Maps URL whose place label is `Taylor's%20University%20Lakeside%20Campus`. Direct live HTML contains the same embed. The adjacent text gives SEGi's Kota Damansara address. The hero labels the location “Kota Damansara, KL”, although official information places it in Petaling Jaya, Selangor. This is a concrete decision-quality problem, not a speculative ranking factor.

**Proposed correction:** point the map to the verified SEGi University Kota Damansara campus; label the location “Kota Damansara, Selangor”; retain the full official address. Check the “direct bridge”/MRT assertion against a current route source before retaining it. [Official campus/intake contact information](https://university.segi.edu.my/admissions-intake/), [MQA institution record](https://www.mqa.gov.my/mqr/english/eakrKPList.cfm?IDAkrIPTS=307)

The [official SEGi group directory](https://www.segi.edu.my/) separates SEGi University Kota Damansara from its colleges, including Petaling Jaya, Kuala Lumpur, Subang Jaya, Penang and Sarawak; it also lists the Sibu medical sub-campus. This supports a concise institution/teaching-location table. Do not imply all stages of every University programme occur in Kota Damansara. A [2020 official medicine article](https://university.segi.edu.my/advantages-of-studying-medicine-in-segi/) describes years 3–5 in Sibu; this is dated evidence and should be reconfirmed on the current programme/offer before presenting it as current intake guidance.

### 3. Ranking “refresh” work would repeat completed work

QS currently reports **Taylor's #272 in World 2027** and **SEGi #701–710 in World 2027**, matching existing source pages. Preserve these edition-labelled sections. QS profiles contain older overview statements alongside their newer ranking tables, so extract facts from the correct edition, not a promotional summary. An overall ranking does not establish a computing/medicine programme's rank or professional accreditation. [Taylor's QS profile](https://www.topuniversities.com/universities/taylors-university), [SEGi QS profile](https://www.topuniversities.com/universities/segi-university)

### 4. Details pages can become more useful through selected verified course rows

The current programme examples are intentionally limited and derived from stored fee schedules. Generic advice about checking course pages is safe but weak as the final answer to a course/intake query. Add a small, maintained course decision table to each details page: exact programme, institution, teaching location or study mode, duration, source's intake wording, admission/accreditation source, and deep link to the matching fee section. Select programmes from actual query/enquiry evidence; Computer Science is a research candidate, not a proven high-volume opportunity.

Taylor's official Computer Science page identifies a three-year full-time programme, February/April/September intake months, and a dual-award arrangement with UWE. These are programme-specific facts, not all-University rules. Its key-intakes page provides different postgraduate calendars. Do not convert listed months into “applications open” assertions. [Computer Science programme](https://university.taylors.edu.my/en/study/explore-all-programmes/computer-science/undergraduate/bachelor-of-computer-science.html), [official key intakes](https://university.taylors.edu.my/en/study/how-to-apply/key-intakes.html)

SEGi's official search-indexed intake page lists January/May/September for conventional levels and a separate online calendar. Its Computer Science page displays a provisional MQA code, while the [MQR record for Computer Science in Cyber Security](https://www2.mqa.gov.my/mqr/english/epapar_print.cfm?NoRujA=MQA%2FFA11188&idakrkp=11381) is a distinct named qualification. Do not combine either with the ODL programme or claim all have the same accreditation status. Direct retrieval of some `university.segi.edu.my` pages returned 502 in the research tool; these points rely partly on official search extraction and require direct re-verification before publishing codes/intakes. [Conventional Computer Science page](https://university.segi.edu.my/course/bachelor-of-computer-science-hons/), [ODL Computer Science page](https://university.segi.edu.my/course/bachelor-of-computer-science-honours-odl/)

### 5. SEGi fee notes still need a dated, applicable source

The fee page already distinguishes total, annual and registration amounts and warns that postgraduate visa renewal can be excluded. The official international-admissions page's search extraction refers to RM3,150 admission/visa application fees subject to change, but this does not validate every tuition row or its intake. A current complete University international schedule was not verified in this sub-study. Obtain the applicable official document, then match each row and note by programme, campus, student category and period. Do not import amounts, scholarships or tax arithmetic from agency pages. [Official international admissions](https://university.segi.edu.my/international-students/)

## Search and competitor research log

All eight exact queries below were run on **5 October 2026** using ordinary web search. Language English; no controlled search-engine location. Queries containing Bangladesh indicate candidate audience intent only. Result order is not reported as a Google rank. Volumes and market shares are unknown.

| Institution | Exact query | Candidate intent/page owner | Pages observed in sampled results |
| --- | --- | --- | --- |
| Taylor's | Taylor's University international fees tuition 2026 Malaysia fees schedule | International tuition / fees | Official fee selector/PDFs; Global Admissions; StudyU; SharifStudy |
| Taylor's | Taylor's University QS ranking 2026 Lakeside intakes | Institution/ranking/campus / details | QS profile, official pages, independent admissions guides; current result editions include 2027 |
| Taylor's | Taylor's University computer science fees international Bangladesh | Programme cost / fees | Official CS page/PDF; Bangladesh-focused agency fee page; document resellers |
| Taylor's | Taylor's University intakes international students Bangladesh | Programme/intake/entry / details | Official key-intakes page; admissions material; international-student discussions |
| SEGi | SEGi University international fees 2026 Kota Damansara | University international tuition / fees | Global Assistant; ZSK Solution; official material mixed with agency pages |
| SEGi | SEGi University QS ranking 2026 Kota Damansara intakes | Institution/ranking / details | QS, SEGi annual report, independent guides; separate College results also appeared |
| SEGi | SEGi University computer science fees international Bangladesh | Programme cost / fees | EasyUni; GAC; official course results |
| SEGi | SEGi University intake international students Kota Damansara | Campus/intake / details | Official University intake page; separate SEGi Colleges campaign; college admissions pages |

Competitor observations describe presentation, not independent validation of their claims:

| Sampled page | What the student gets | Useful gap One-Step can address |
| --- | --- | --- |
| [Taylor's official fee selector](https://university.taylors.edu.my/en/study/scholarships-and-financial-aid/fees-schedules.html) and linked schedules | Authoritative school/category selection and programme payment schedules | Explain the selected edition in accessible HTML and connect its programme row to actual first-payment stages without losing exclusions |
| [StudyU Taylor's guide](https://www.studyu.org/en/university-taylors) | Programme examples, an explicit intake-specific cost breakdown, source links, institution distinction and currency-conversion method | Keep university payment currency and stored official USD reference separate; offer Bangladesh qualification/financial-document assessment when the audience is confirmed. Do not copy Russia-oriented advice or their conversion values |
| [Global Admissions Taylor's guide](https://www.globaladmissions.com/guides/taylors-university-admissions) | Extensive programme/admission/cost/deadline navigation and enquiry CTA | Match each deadline and payment period to a current primary source; its visible “next deadline” included 1 August 2026, already past on this research date. Length alone is not reliability |
| [GAC SEGi Computer Science page](https://www.gaconnt.com/course/bachelor-of-computer-science-honours) | MYR/BDT display, staged first-year payments, annual amounts, scholarship message, course-specific enquiry links | Comparable clarity with direct official edition/inclusion evidence and no automatic award assumption; avoid treating calculated agency totals as official data |
| [EasyUni SEGi CS](https://www.easyuni.com.bn/malaysia/segi-university-246/bachelor-of-computer-science-hons-294334/) | Separate tuition/miscellaneous fields and local/foreign categories | Show the Malaysia payment currency, programme mode and source date explicitly; the sampled localized page uses BND, illustrating why currency context matters |
| [Global Assistant SEGi guide](https://globalassistant.info/segi-university-tuition-fees-courses-ranking-scholarship-intake-hostel/) | Broad fee/intake/ranking/hostel guide in a single page; later fetches timed out | Maintain One-Step's complementary fee/details intent split and test whether users reach the precise fee section; do not copy unsourced omnibus claims |

## Four-page proposal for integration into the ten-page plan

Effort: S = under half a day of implementation after evidence is ready; M = roughly 1–2 days including source reconciliation and verification. These are task estimates, not traffic projections. Source procurement can add elapsed time.

| Page | Likely limitation and confidence | Proposed change | Priority / effort | How to test the hypothesis |
| --- | --- | --- | --- | --- |
| Taylor's fees | Proven edition/amount ambiguity; modest historical fee-query impressions. High confidence in provenance gap; low confidence that CTR is the main bottleneck | Reconcile selected source schedules, label University/College and intake/date, expose tuition versus with/without-tax total and first-payment basis when sourced; retain current title initially | P1 / M | Source parity first; then fee-query clicks/impressions, position-controlled CTR and qualified enquiries; monitor current baseline before attributing effect |
| Taylor's details | Adequate discovery historically; real course selection detail and authority likely constrain long-tail relevance. Medium confidence | Add a few officially verified programme/location/mode/intake rows, replacing generic examples for those rows; preserve ranking section and current title | P2 / M | Named-programme impressions/clicks on details, fee-section transitions, qualified enquiries; insufficient evidence to judge if rows remain sparse |
| SEGi fees | Very sparse historical Bangladesh data and weak dated tuition provenance. High confidence in data gap; low in commercial upside size | Obtain/reconcile official University schedule, label source applicability and charge stages; avoid college or ODL schedule substitution | P1 evidence / M; numerical update gated by source | Row/notes/source consistency; conventional University fee-query visibility and enquiries; do not evaluate 0/6 as a stable CTR estimate |
| SEGi details | Confirmed wrong map and incomplete campus-stage distinction; historic position 16.4 suggests competitiveness may also matter. High for map, medium for content hypothesis | Correct map and Selangor label, distinguish University/colleges and programme teaching stages; select verified course rows; retain sourced rankings | P1 map / S; P2 course rows / M | Correct destination and campus facts; campus/intake query performance and qualified enquiries; compare like devices and position bands |

## Concrete draft wording to approve

Metadata is already differentiated. Keep current titles for all four pages unless current query data reveals a specific mismatch. A fresh title is not intrinsically an improvement. Proposed descriptions below are conditional on the new sections being present and accurate; they can be tested separately from fee-data changes to improve attribution.

| Page | Proposed description | Proposed visible additions |
| --- | --- | --- |
| Taylor's fees | “Check Taylor's international programme fees, schedule dates, payment periods and additional charges. Distinguish University and College fee schedules.” | H2 “Which Taylor's fee schedule applies to you?”; H3 “Tuition, total programme cost and first payment” |
| Taylor's details | “Explore Taylor's University courses, Lakeside campus and programme intakes. Check official course sources and the difference from Taylor's College.” | H2 “Choose a Taylor's University programme”; H3 “University degree or College pathway?” |
| SEGi fees | “Check SEGi University international fees for Kota Damansara programmes. Read the schedule date, annual payments and charges excluded from each total.” | H2 “Which SEGi University schedule applies?”; H3 “Registration payment, annual amounts and excluded charges” |
| SEGi details | “Explore SEGi University in Kota Damansara, Selangor. Check courses, teaching locations, intakes and rankings, and distinguish SEGi colleges.” | H2 “SEGi University campus and teaching locations”; H3 “Check the exact programme and study mode” |

Taylor's fee draft:

> Match the institution and programme in your offer to the schedule below. Taylor's University and Taylor's College publish separate information. A programme total, a tuition-only figure and the amount due for the first semester are different amounts. Use the schedule's own currency, payment dates and inclusion notes.

Add structured fields, with populated values only when verified: **Institution · Programme · Student category · Campus/study mode · Applicable intake · Document date · Fee period · Included charges · Exclusions · Official source · Last source check**. “Last source check” must describe an actual check, not an automatic page build date. Until an old row's edition is established: **“Stored schedule; applicable intake not yet verified. Request the current programme-specific quotation before budgeting or paying.”** This wording should appear alongside the affected section, not only in a collapsed FAQ.

Taylor's details draft:

> Taylor's University and Taylor's College are separate institutions. Use the University course page for the degree you want and the College page for a foundation or other College pathway. Confirm progression requirements before treating a pathway offer as admission to a degree.

SEGi details draft:

> SEGi University is based in Kota Damansara, Petaling Jaya, Selangor. SEGi colleges are separately named institutions. Check the teaching location and study mode for your exact programme; the University name alone does not establish where every stage is taught.

SEGi fee draft:

> These sections cover the stored SEGi University schedule identified in each table. Do not use them for a SEGi College or online offer without the matching schedule. Read the registration amount and annual columns alongside the administration and visa notes; a total does not automatically include every renewal or living expense.

Specific links: retain details → `/Fees_Chart/taylors-fees#fee-category-2` for verified bachelor examples and → `/Fees_Chart/segi-fees#fee-category-1` for matching University bachelor examples. Retain fees → `/Universities/{slug}-details#courses-intakes` for course/intake planning and → the existing scholarships section for conditions. Add an adjacent direct official programme/source link per newly verified row. Avoid repeating full fee tables on details pages; avoid ranking/identity paragraphs on fee pages. No new near-duplicate programme landing pages are proposed.

Removals/replacements: replace the wrong SEGi map; correct “Kota Damansara, KL”; replace generic programme examples only where researched rows improve them; remove or qualify unsupported campus/superlative claims during the targeted fact review. Preserve fee data until reconciled; do not remove dated ranking evidence that currently matches the provider.

## Evidence → mechanism → measurement → decision

1. **Source mismatch/unknown edition → visible provenance and reconciled charge interpretation → students can compare a valid offer and trust the fee answer → fee-section use, completed qualified enquiries, non-One-Step fee-query clicks →** ship only when every changed amount matches the chosen official edition; retain if useful engagement/enquiries improve without factual regressions. Do not claim a ranking benefit from accuracy alone.
2. **SEGi wrong map → correct institution/location → less student confusion and a trustworthy campus answer → correct map-link target, campus-related enquiries/query relevance →** mandatory correctness fix independent of traffic sample size.
3. **Limited generic course examples → a small sourced course/mode/intake table → more precise answers for candidate programme/campus queries → cluster impressions, clicks and fee-section transitions →** expand only where query/enquiry evidence warrants maintenance; do not mass-produce programme prose.
4. **Sparse historical page/query rows → refreshed segmented baseline and event definitions → distinguish discoverability, snippet and enquiry problems →** analyse equivalent complete windows at deployment +28/+56/+84 days. If counts remain sparse, pool the five-institution fee cluster and extend the window while retaining individual-page rows. Report uncertainty, not a “failure” from a handful of impressions.

On-page work can repair trust and relevance but cannot establish enough authority to outrank official institutions for broad navigational queries. Actual link/authority data was not available, so an authority deficit remains a hypothesis. Legitimate opportunities for later approval: a documented institutional adviser/agent directory listing if the relationship is real; a jointly reviewed fee-reading guide; permission-based interviews with Bangladesh students about programme/campus decisions; attribution-worthy original comparisons with dated sources. No contacts, link purchases or promises of placement were made.

## Implementation constraints and verification after approval

Update generated guidance through `data/university_seo_content.json` and `scripts/university_seo_content.js`; inspect generator contracts before adding new fields. Update fee amounts only through the true fee source and generator after a source diff. The map is authored page markup and needs its own scoped edit. Preserve filters, fee-section IDs, repeated-anchor behavior, table/download parity and working canonicals. Review shared-generator output outside the ten-page set before including it. Run existing generator check modes and the relevant SEO, layout and fee interaction tests. Deployment and Search Console submissions remain separate authorization steps.

Unresolved inputs: priority country; current page/query/country/device performance windows; qualified-enquiry records; current SEGi full international fee schedule; programme priorities backed by enquiries; current programme-level accreditation/intake verification where source retrieval was incomplete. These gaps do not justify changing live prices from agency websites.
