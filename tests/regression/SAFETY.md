# Runtime test safety checklist

Before any runtime test, verify the web app deployment is attached to the Test Copy project and that its active spreadsheet is the Test Copy spreadsheet.

Allowed first-pass checks: open the Test Copy URL, verify the login page renders, inspect browser console/network errors, and test read-only public lookups only when their inputs are known to be safe.

Do not run setup/seed functions, account registration or approval, record save/update/delete, payment, receipt creation, OTP/login email, quick-service SMS/email, media upload/delete, or location database refresh during unattended tests. These can write data, send messages, or make external requests.

Never put passwords, OTPs, spreadsheet contents, or personal records into GitHub Actions logs or repository files.
