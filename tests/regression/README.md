# Jannatul Baqi — regression checks

This branch is based on deployed source commit `8852ac4eb83db73b628640f2670bdb1ef574c21d`.

## What runs

- JavaScript syntax checks for every inline script in `Index.html`, `code.gs`, and `LocationData.gs`.
- Confirms `doGet()` serves `Index.html`.
- Checks every client `call('endpoint', ...)` against server-side function declarations.
- Detects duplicate server function declarations.
- Checks that every key in `SHEETS` has a matching key in `HEADERS`.
- Verifies critical client integrations remain wired.

## Safety boundary

These checks are static and read-only. They do not execute Apps Script, open the web app, modify a spreadsheet, create accounts, process payments, or send SMS/email. Side-effect integrations are inventoried to guide later manual tests.

A passing run is **not** proof that the live UI or server workflows work. Runtime testing must use the separately confirmed Test Copy and must avoid real email/SMS and data-changing actions.

## Run locally

Requires Node.js 20 or newer:

```sh
npm test
npm run test:audit
```

## Current baseline finding (8852ac4)

The first inline script in `Index.html` fails JavaScript parsing. The parser points to script line 300, corresponding to `Index.html` line 1265: a single-quoted `var html='...'` string is followed by a literal line break after `body.innerHTML+'`, before the `<style>` markup. This causes a syntax error (`Invalid or unexpected token`) and the syntax regression test correctly fails. The application source is intentionally left unchanged in this testing branch.
