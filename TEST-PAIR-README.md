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
- **Issue found:** the GS appends `mobile` into both the CONTACTS `Mobile` and `WhatsApp` columns. The HTML form does not collect a separate WhatsApp number. The WhatsApp column should be blank unless a separate WhatsApp value is supplied.
- If email sending succeeds but CONTACTS append fails, the function can return an error even though the email was already sent; the one-minute throttle may also prevent an immediate retry.
- The HTML source blob is 1,483,276 characters / 18,900 lines. GS source is 340,370 characters / 4,144 lines.

## Validation boundary

This is a source-level review only. No Apps Script runtime, spreadsheet, email delivery, browser interaction, or print output has been tested. Do not deploy this branch until the remaining checks and fixes are approved.
