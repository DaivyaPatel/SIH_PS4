# Regulatory research source register

Checked: 25 October 2026 | Status: research evidence; no production policy approved

Canonical metadata and SHA-256 values: [source-register.json](../../config/regulatory/source-register.json). Hashes identify the actual downloaded bytes, not the truth, latest status or legal applicability of their content. PDF page numbers below are **1-based actual downloaded file pages**. Printed page labels differ. Raw PDFs and extracted text stay in ignored local research storage; do not commit third-party bundles or institutional evidence.

## Retrieved primary documents and official-hosted copies

| ID | Origin / host and content | Pages / clause anchors | Applicability and limitation |
|---|---|---|---|
| SRC-APH-BASE | [AICTE APH, government-hosted copy](https://cdnbbsr.s3waas.gov.in/s35938b4d054136e5d59ada6ec9c295d7a/uploads/2025/03/2025031399.pdf) | PDF 23–24: 1.8/1.9; 28: 2.1(e), 2.2; 44: Table 2.2; 45–46: 2.23/2.24/Table 2.3; 72: 6.17(a) | Base 2024–27 text; category-specific processing, conditional hearing/appeal, lease horizon and notified schedules. Not a current consolidated rule pack. |
| SRC-ADDENDUM-MIRROR | [AICTE addendum in Rajasthan government bundle](https://hte.rajasthan.gov.in/Website/DepartmentOfCollegeEducation/CONTENTFILES/AICTE%20Approval.pdf) | Cover PDF 6; printed 1–17 / PDF 7–23; definitions PDF 7; 2.23.3 amendment PDF 16 | 2026–27 amendment copy retrieved; authority/visit-mode changes require review. Exact equivalence to missing Updated file and completeness of later amendments unknown. |
| SRC-NOTICE-RAJ | [AICTE public notice in the same bundle](https://hte.rajasthan.gov.in/Website/DepartmentOfCollegeEducation/CONTENTFILES/AICTE%20Approval.pdf) | PDF 4–5 | Category-specific historical submission notice; do not treat original dates as latest operational deadlines. Same container checksum as the addendum entry, not a separate-file checksum. |
| SRC-CIRCULAR-KERALA | [Kerala DTE circular, 30 November 2025](https://dtekerala.gov.in/static/selffinancing/document-434.pdf) | PDF 1; DTETVM/10510/2025-SBTE1 (PLA) | State polytechnic/NOC coordination; no inference of nationwide stage SLAs. |
| SRC-NOTICE-UP | [UP technical education bundle](https://bteup.ac.in/PDFFILES/NEWS_639005651817728160.pdf) | Attached AICTE notice PDF 4 | Another historical notice copy; does not establish the latest extension/schedule. |

The PDF downloads returned HTTP 200 and were checked for a PDF header before hashing. A government host supplies provenance but does not, by itself, prove that a copy is the latest applicable regulatory version. The authoritative originator and the retrieval host are separate concepts.

## Retrieval failures and unresolved corpus gaps

| ID | Attempt | Result / consequence |
|---|---|---|
| SRC-UPDATED-ADDENDUM-UNAVAILABLE | [Previously cited Updated addendum](https://aicte.gov.in/downloads/aph/Final%20Addendum%202026-27_Updated.pdf) | Web fetch returned 404; no PDF checksum available. Government bundle is an available research alternative, not proven identical replacement. |
| SRC-OFFICIAL-APH-UNAVAILABLE | [Indexed regulator base endpoint](https://www.aicte.gov.in/sites/default/files/APH%20Final.pdf) | Web fetch returned 404; use the identified government-hosted copy for research with its own hash. |
| SRC-APPROVAL-INDEX-UNAVAILABLE | [2026–27 approval index](https://www.aicte.gov.in/approal-process-2026-2027) | Inaccessible via the web tool; no exhaustive check of later notices can be claimed. |

No hash is invented for unavailable source bytes. Retrieval failure is an observation about this attempt, not proof a document does not exist. Remaining activation blockers: obtain the complete applicable amendments/later notices, determine source precedence and effective dates, and secure named owner approval of executable bindings.

## Supersession and review

The addendum references changes to the base APH, but this does not establish replacement of the whole handbook. Keep clause-level candidate relationships in [amendment review notes](./amendment-review.md). Exact superseding IDs are unset until an authorised reviewer confirms applicability and effective dates. No filename, download date or third-party publication date automatically wins a conflict.

Each source currently has `productionActivationAllowed: false`. Research verification, official-owner approval and executable-policy activation are separate states. Every later rule needs source ID/hash, clause/printed page/PDF page, academic year/category, effective date, reviewer/authority and regression fixtures.

## Supplied research context

The three supplied context documents are hashed in `contextInputs` in the canonical register. They guide discovery but are not regulations. Older claims about committee constitution, online-only visits, annual renewal, signatures and appeal/correction rights must be evaluated against current applicable primary sources. Preserve the original research; correct derived PRD references rather than editing historical notes to hide the change.

## Rechecking evidence

Run `python scripts/check_source_register.py` from the repository root for metadata/context checks. If the downloaded PDFs are present locally, run `python scripts/check_source_register.py --cache-dir .local/research` to verify bytes and hashes as well. Checks are offline, use Python's standard library and require no credentials or model. Re-downloading changed bytes requires a new reviewed source entry/version; do not replace a registered checksum just to silence a mismatch.
