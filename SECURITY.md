# Security checklist (BlueCut / vinted-next)

This project is a small SaaS-style app (auth + uploads + jobs + optional worker callback). This file tracks security measures that are implemented and what to add for production hardening.

## Implemented

- Authentication via NextAuth (Credentials + optional Google) with `NEXTAUTH_SECRET` support.
- Passwords stored as `bcrypt` hashes.
- Password reset tokens are stored hashed and expire.
- Rate limiting for auth flows and job creation (per IP / per user).
- Same-origin enforcement for sensitive POST routes (anti cross-site spam/CSRF-style abuse).
- Job ownership checks for job status and downloads.
- Worker endpoints protected by `x-worker-secret` (timing-safe compare).
- Upload validation:
  - Size limits via `MAX_UPLOAD_MB`.
  - Allowed formats PNG/JPEG/WEBP.
  - Content sniffing via magic-bytes (does not trust `file.type`).
- Security headers (frame deny, nosniff, referrer policy, permissions policy, CSP, HSTS in prod).

## Production hardening to add (recommended)

- Strict CSP with nonces (remove `unsafe-inline`) if you want stronger XSS protection.
- Self-host fonts/icons (or add explicit CSP allowlist) to reduce third-party dependencies.
- Verify upload content even more strictly (e.g., decode with an image library) before processing.
- Storage retention cleanup job to match the privacy policy (e.g. delete uploads/outputs after 24h).
- Monitoring/alerting for spikes in `401/403/429/500` and worker failures.
- Regular dependency audit (`npm audit`) and patching.

