# Taylor's and INTI: source-to-row review

Checked **6 October 2026**. Review material only: **no fee number, fee note, tax rate or currency conversion was replaced**. `data/fees_data.json` is byte-for-byte unchanged. The approved page changes label source uncertainty and improve interpretation.

The [116-row ledger](fee-reconciliation-ledger.csv) inventories every stored Taylor's row (40) and INTI row (76), including its section, position, programme, duration/intake text, labelled fee columns, candidate primary source and reconciliation status. Five rows have directly checked numerical comparison evidence below. The other **111 rows are explicitly pending exact source reconciliation**; the ledger does not certify them as current or wrong. Do not treat a selector/catalogue link as verification of a number.

## Taylor's international undergraduate schedules

Source: [official international Computer Science school PDF](https://university.taylors.edu.my/content/dam/taylorsrevamp/university/study/scholarships-and-financial-aid/fees-schedule/school-of-computer-science/undergraduate/taylors-fees-schedule-ug-computer-science-usd.pdf), reached from the institution's [fee selector](https://university.taylors.edu.my/en/study/scholarships-and-financial-aid/fees-schedules.html). A dated [downloaded copy](official-sources/taylors-cs-international.pdf) is saved for review. SHA-256: `92c155ca76b663106a8a8aee16a177752d33e86eadb01aa883de6bcbe39fc5a6`.

The PDF has seven physical pages. Its programme schedules are dated **14 August 2026**, for **September 2026 intake**; the faculty notes on physical page 1 carry a different date, **5 June 2026**. Preserve this distinction. It is not evidence of fees or open applications for a later intake.

| Stored location | Stored programme/columns | Official matched evidence | Review outcome |
| --- | --- | --- | --- |
| `taylors.categories[2].table.rows[3]`, Bachelor section row 4 | Bachelor of Computer Science (Hons); 3 years; **Total Fee (RM) RM135,738; Total Fee (USD) $31,567** | Physical page 2: Bachelor of Computer Science (Honours), international, September 2026. Tuition **RM124,080**; total without SST **RM143,944**; total with SST **RM152,187 / USD40,049**. Physical page 3 describes a separate work-based/technopreneurship route. | Exact qualification family found, but stored edition and inclusions unknown. Do not replace a programme total with tuition only or silently select a different study route. |
| `taylors.categories[2].table.rows[4]`, Bachelor section row 5 | Bachelor of Software Engineering (Hons); 3 years; **Total Fee (RM) RM135,738; Total Fee (USD) $31,567** | Physical page 6: Bachelor of Software Engineering (Honours), international, September 2026. Same displayed tuition and grand-total columns as above. Physical page 7 is the work-based route. | Programme-specific comparison available; exact route, edition and component reconciliation still required. No update approved. |

The official schedule separately lists enrolment, insurance, international charges, annual fees, EMGS and security deposit. It has a table column for totals **with** SST alongside totals **without** SST, although its general note describes fee figures as exclusive of SST. That column/notes distinction must remain explicit. RM is the payment basis; the USD reference uses the issuer's stated indicative conversion. Do not create a current BDT value or infer payment instructions from One-Step's old USD ratio.

First-semester payments and full programme totals are different figures. A new source can show a different total because its edition, tax treatment, components or payment stages differ; this is **not a measured tuition price increase**. Physical pages 2 and 6 were also visually checked in Chrome's PDF viewer: tuition, without-SST total, with-SST RM/USD totals and the separate programme labels match the extracted figures. The original PDF is saved. Institution clarification of any remaining scope ambiguity is still required before a numerical update.

Before proposing a replacement: identify the original stored document/edition; confirm the intended programme/route and international intake; reconcile all components and exclusions; align the webpage, downloaded document and visible source labels; present the exact replacement values for approval. Foundation rows need their own University/College attribution rather than using this undergraduate University PDF.

## INTI Diploma in Computer Science

Source: [official Diploma in Computer Science page](https://newinti.edu.my/programme/diploma-in-computer-science/), directly fetched HTTP 200 on 6 October. [HTML snapshot](official-sources/inti-diploma-cs.html) and [text snapshot](official-sources/inti-diploma-cs.txt) are retained. The page identifies local and international columns, campus-specific approximate figures, a minimum two-year programme duration and a tax exclusion note.

| Stored location | Institution | Stored **Total Tuition Fee (RM)** | Official **international approximate fee** | Missing dimensions before any update |
| --- | --- | ---: | ---: | --- |
| `inti.categories[0].table.rows[23]`, Penang row 24 | INTI International College Penang | RM39,000 | RM42,900 | Source issue/intake validity, exact fee period and complete compulsory-charge schedule |
| `inti.categories[1].table.rows[15]`, Nilai row 16 | INTI International University | RM42,640 | RM46,900 | Same; University rather than College schedule |
| `inti.categories[2].table.rows[14]`, Subang row 15 | INTI International College Subang | RM44,380 | RM48,820 | Same; exact College/award and payment stages |

The official page describes its figures as approximations and says published fees exclude SST, with 6% applied to international fees. Its two student-category columns currently display equal amounts for these rows; this does not make the categories interchangeable. The page does not supply a confirmed current-intake invoice, edition date or complete payable breakdown. Its approximate fee label is not enough to assert that it has the same scope as the stored **Total Tuition Fee** column. No tax arithmetic or inferred all-in total is proposed.

The old campus notes still list miscellaneous amounts, including EMGS RM2,520. An official application guide was a research lead for a different administrative/EMGS figure, but exact nationality, period, included charges and tax applicability have not been reconciled. Those notes remain unchanged. Do not apply one updated fee or charge to all campus programmes.

## Review decision

Approve **no numerical replacement yet**. The immediate implementation uses honest unconfirmed-edition labels. To authorize numbers later, review a row/component diff tied to the exact issuing document and applicable offer, retaining currency, fee period, campus, student category, source date and exclusions. The 111 pending ledger rows require their own exact documents; neither the five checked comparisons nor an agency schedule validates the remainder.
