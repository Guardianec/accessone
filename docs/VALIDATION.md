# Verification record

Verified on Windows with Node 22.12, npm 11.7, and installed Chrome. Use Node 22.13+ for the lint dependency’s supported engine range.

- Prettier format and format check: passed.
- ESLint: passed.
- TypeScript: passed.
- Four state/privacy unit tests: passed.
- Vite production build: passed.
- Complete browser flow: passed in development and production. This includes five failed providers, validation errors, both profile sections, both CAPTCHAs, both verification codes, three calibration samples, humanity tasks, all 36 assessment questions, false completion, final review, processing, reveal, reward, achievements, refresh, and reset.
- Mobile refresh/resume, genuine cancel, Escape dismissal: passed.
- Stage sweep at 1440px, 768px, and 390px: passed with no horizontal overflow or password/email/telephone inputs.
- Real 30-second processing sequence with reduced motion: passed on the production build.
- Network observations: no questionnaire/form transmissions. Only static assets were requested by the production app.
- Stored-state inspection: nickname and answer values absent; CAPTCHA, provider, question, and progress-reversal counters correct.
- Browser page errors in the complete-flow test: none.
- Source inspection: no fetch/XHR/beacon/socket clients, external provider calls, tracking, permissions APIs, or backend code.
- Visual review: desktop opening, provider page, mobile opening, and reveal screenshots reviewed; animation capture was disabled for stable screenshots. The access diagram, rail, typography, controls, consent, and responsive hierarchy match the design direction.

Screenshots: `desktop.png`, `mobile.png`, `providers.png`, `reveal.png`.

Limits: Firefox/Safari and physical touch hardware were not tested. Human completion time has not been measured; 8–15 minutes is a design target, not a measured guarantee. Debug mode was used to shorten waits in the complete-flow test; the separate processing test used the actual duration.

Headroom MCP was called for a repetitive browser failure log. Its local compression proxy at port 8787 was unreachable; the tool retained the original with hash `3b5a06b607d2b38321bac1c6` and applied no compression. Focused source and log reads were used. This does not provide automatic compression of Codex traffic.
