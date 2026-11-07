# TEST PAIR — DO NOT DEPLOY

This branch contains isolated test copies only. No original source file was renamed, overwritten, or deployed.

## Exact source mapping

| Test filename | Original repository file | Source commit | Original blob SHA |
|---|---|---|---|
| TEST-HTML.html | 18262 ফাইনাল html.txt | d2442c12c0d56671f94596110138c10a52a15074 | 3d1e2ae9fdab6304359547c7170eeb75de4f2f47 |
| TEST-GS.gs | 3434 code.gs.txt | d046eb45ed0193218c40d5e72e97988375c4c772 | c0e0b7957dd359f9b4f5dc752380efab3eb42290 |

## Important lineage warning

These two source commits have different parent commits. They are being paired here only for isolated inspection; this does NOT establish that they were deployed or tested together.

## Static review notes

- HTML calls `sendQuickService` with arguments `(token, data)`; its public login-page token is initially an empty string.
- GS permits an empty token for this public endpoint and authenticates only when a token is supplied.
- GS validates name/mobile/email/message, limits message length, applies a one-minute cache throttle, emails the configured address, and appends a CONTACTS row.
- **Fixed in TEST-GS.gs:** the CONTACTS `WhatsApp` column now receives only `data.whatsapp`; because the current HTML form has no separate WhatsApp field, it remains blank rather than duplicating the mobile number.
- **Fixed in TEST-GS.gs:** the inquiry is saved to CONTACTS before attempting email notification. If email delivery fails after saving, the endpoint returns `ok:true` with a clear notice that the inquiry was saved but email notification failed. If saving fails before the record is stored, the temporary one-minute throttle key is removed so the user can retry.
- WhatsApp input is optional and validated if a future caller supplies it.
- The HTML source blob is 1,483,276 characters / 18,900 lines. GS source is 340,370 characters / 4,144 lines.

## Validation boundary

This is a source-level review only. No Apps Script runtime, spreadsheet, email delivery, browser interaction, or print output has been tested. Do not deploy this branch until the remaining checks and fixes are approved.


## Changes and test results (2026-11-07)

- Updated only `TEST-GS.gs`; the source GS backup and source HTML were not modified.
- Whole GS file syntax check: PASS.
- `sendQuickService` isolated syntax check: PASS.
- HTML script containing `sendQuick()` syntax check: PASS.
- Mocked behavior checks:
  1. Public request with empty token: saved successfully; WhatsApp column blank.
  2. Mail service failure: inquiry still saved; response clearly reports notification failure.
  3. Empty message: rejected; no row saved.
  4. Invalid supplied token: rejected; no row saved.
- Initially, 8 additional HTML script blocks failed syntax parsing. These were repaired in the isolated `TEST-HTML.html` copy only: broken print-document string assembly, over-escaped Drive URL regular expressions, nested quotes in the exam-registration button, two incomplete script wrappers that swallowed CSS blocks, and a malformed online-results print string.
- After repair, all 185 JavaScript script blocks in `TEST-HTML.html` passed `new Function` syntax compilation (0 failures). This is a syntax check, not a full browser execution test.
- Print-preview/download strings in the affected blocks were simplified to valid standalone HTML; the misplaced CSS fragments were not applied as page styles and were excluded from those generated print/download documents.
- No Apps Script deployment, live spreadsheet, actual email delivery, or real browser test was performed.

## HTML-to-GS integration audit (2026-11-07)

The repaired HTML was checked for literal server-function calls against both TEST-GS.gs and the repository's LocationData.gs in this branch.

Seven HTML-called server endpoints were not found in either supplied server file:
- approveStudentAdmission — Super Admin admission approval button.
- getPrivateGalleryPhoto — loading admin-only gallery photos.
- listGalleryPhotos — loading the photo gallery.
- getQuestionPaper2026 — question-paper lookup.
- listQuestionBank2026 — loading the question bank.
- saveQuestionBank2026 and saveQuestionPaper2026 — saving question-bank and question-paper data.

These are unresolved server-side dependencies, not HTML syntax errors. No replacement functions were invented because the sheet schemas, permission rules, and validation requirements are not established by this pair. Treat these features as unverified and potentially nonfunctional until the intended server implementations are supplied or confirmed from the matching project source.

A separate code.gs exists in this branch but is a different, older source file and is NOT part of commit d046eb45; it was not mixed into TEST-GS.gs. The two selected source commits also have different parent histories.
