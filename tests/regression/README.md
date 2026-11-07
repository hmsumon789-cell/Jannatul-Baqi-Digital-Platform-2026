# Jannatul Baqi — Regression Testing

This test suite is intentionally separate from the live application files. It is read-only: it reads `Index.html`, `code.gs`, and `LocationData.gs`; it does not call Google Apps Script services, write to a spreadsheet, change deployments, or modify application source.

## Run locally

Requires Node.js 20 or newer:

```bash
npm test
npm run test:audit
```

## Checks included in this first protected baseline

- JavaScript syntax parsing for every inline script in `Index.html`.
- JavaScript syntax parsing for `code.gs` and `LocationData.gs`.
- Confirmation that `doGet()` serves the actual `Index` HTML file.
- Mapping of client `call('serverFunction', ...)` endpoints to server declarations.
- Duplicate server-function declaration detection.
- Module coverage inventory for dashboard module keys and server-side entry points.
- Spreadsheet sheet/header consistency checks.
- Diagnostic warnings for duplicate HTML IDs, repeated client function names across script blocks, and inline handler names that static analysis cannot resolve.

Warnings are deliberately non-blocking in the first baseline. The current source also has one explicitly recorded baseline syntax defect: `doSearch()` contains `await` but is not declared `async`. The test suite permits only this exact known finding; any different/new syntax finding fails the gate. Fixing this source defect will remove the baseline exception. The current application contains repeated IDs and repeated helper names in separate script blocks; a static scanner cannot safely decide whether each is a live defect. Do not auto-rename or rewrite these items.

## CI

GitHub Actions runs the read-only checks on pushes, pull requests, and manual workflow dispatch. The JSON audit report is uploaded as a workflow artifact.

## Important limitation — browser and Apps Script runtime

A static pass does **not** prove that a button works, that a spreadsheet has the expected headers/data, that permissions and OTP delivery work, or that a payment/receipt workflow completes. Those checks require a dedicated non-production Apps Script deployment and a separate test spreadsheet with synthetic records.

Do not point destructive or write tests at the live madrasa spreadsheet. Before enabling end-to-end tests, provision a staging deployment, test accounts, and synthetic records. Runtime tests must clean up only their own test data and must never send real SMS/email or alter production account/payment data.

## Current baseline finding

The initial CI run found `Index.html` inline script block 1, in `function doSearch(where)`, with `await is only valid in async functions`. This finding is recorded as a known baseline issue and is not fixed by this test-only branch. The first syntax error in a script block can mask later syntax errors in that same block; rerun after the first one is corrected.

## Planned expansion

1. Build the client dependency map from HTML controls to client functions to server endpoints.
2. Add browser-level smoke tests against a staging Web App.
3. Add isolated server workflow tests for login/OTP, registration, student lookup, payment/receipt, exam/results, attendance, finance, media, location data, and account permissions.
4. Require the complete relevant regression suite to pass before merging application changes.
