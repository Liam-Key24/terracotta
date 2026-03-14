# Security Audit – Terracotta

**Date:** 2025-03  
**Scope:** App (Next.js), API routes, CRM auth, reservation/contact flows, file storage.

**Security rating: 7.5 / 10**

| What’s strong | What’s missing or limited |
|---------------|----------------------------|
| No hardcoded secrets or login defaults; env required (503 if missing). | Reject link uses raw `queueId` (guessable if ID is known). |
| Reservation confirmation token is HMAC-SHA256 signed; only signed tokens accepted. | No CSRF protection on CRM login. |
| Per-IP rate limiting on reservation and contact POSTs (10/60s). | Rate limit is in-memory (resets on restart; multi-instance needs Redis). |
| 2-month data retention; lazy cleanup on read. | Dependency audit and security headers not verified in this audit. |
| Session cookie: httpOnly, secure in prod, sameSite, HMAC-signed. | |
| Input validation, length clamping, and HTML escaping in email/output. | |
| No passwords or full tokens in logs; generic error messages to clients. | |

---

## Executive summary

- **Addressed:** No hardcoded default secrets or login credentials; env required (503 if missing). Reservation confirmation token is HMAC-SHA256 signed; only signed tokens accepted.
- **Addressed:** Per-IP rate limiting on `POST /api/reservation` and `POST /api/contact` (10 req/60s).
- **Addressed:** Data retention: reservations, queue, alternatives, and cancellations older than 2 months are removed on read.
- **Medium:** Reject/confirm links use signed token where applicable; raw `queueId` in reject URL remains guessable if ID is known. No CSRF on login.
- **Low:** Cookie and token practices are sound; input validation and escaping in place.

---

## 1. Authentication & session (CRM)

| Finding | Severity | Details |
|--------|----------|---------|
| **Secret from env only** | OK | `auth.ts` and `middleware.ts` use `CRM_SECRET ?? ADMIN_SECRET ?? ''`; no literal default. If unset, cookie signing fails and login returns 503. |
| **No default admin/dev passwords** | OK | `login/route.ts` requires `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `DEVELOPER_PASSWORD` from env; returns 503 if any missing. Same in `developer/verify-reveal/route.ts`. |
| **Cookie settings** | OK | `httpOnly: true`, `secure` in production, `sameSite: 'lax'`, 24h `maxAge`. |
| **Session verification** | OK | HMAC-SHA256 over payload; expiry checked; role restricted to `admin` \| `developer`. |
| **Middleware vs API** | OK | Middleware protects `/crm`; API routes use `requireCrm` / `requireDeveloper` with same cookie. |

**Status:** Env-only; no defaults. Set `CRM_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `DEVELOPER_PASSWORD` in production.

---

## 2. Reservation confirmation token

| Finding | Severity | Details |
|--------|----------|---------|
| **Token signed** | OK | Token is `base64url(payload).HMAC-SHA256(payload)` in `_confirmToken.ts`. Only signed tokens accepted; no legacy unsigned. |
| **Token length cap** | OK | `token.length > 8000` rejected. |
| **Payload validation** | OK | Required fields and types validated after decode; lengths clamped. |

**Status:** Implemented. Sign with `CRM_SECRET`/`ADMIN_SECRET`; verify in confirm route before using payload.

---

## 3. Alternative-offer token

| Finding | Severity | Details |
|--------|----------|---------|
| **Entropy** | OK | `randomBytes(24).toString('base64url')` (~144 bits). |
| **Storage & expiry** | OK | Stored server-side; 7-day expiry in `_alternatives.ts`. |
| **One-time use** | OK | Removed after successful confirm. |

No change required for this token.

---

## 4. Input validation & injection

| Area | Status |
|------|--------|
| **Reservation POST** | Required fields and types validated; email format; guest count 1–20; lengths clamped; `escapeHtml` / `escapeHtmlWithBreaks` in owner email template. |
| **Contact POST** | Same pattern: validation, clamping, escaping in email. |
| **Confirm flow** | Decoded token validated and clamped; queue entry fetched by `queueId` from token. |
| **Reject flow** | `queueId` length ≤ 100; no user input in HTML response. |
| **Path traversal** | Data files use fixed paths under `process.cwd()/data/`. No user input in paths. |
| **SQL/NoSQL** | N/A (JSON files only). |

Recommendation: Keep existing validation and escaping; add signature verification for confirmation token as above.

---

## 5. Rate limiting & DoS

| Finding | Severity | Details |
|--------|----------|---------|
| **Per-IP rate limiting** | OK | `POST /api/reservation` and `POST /api/contact`: 10 requests per IP per 60s via `app/api/_rateLimit.ts`. Returns 429 when exceeded. |

**Status:** Implemented. See §10. For multi-instance deploy, use Redis or similar.

---

## 6. CORS & origin

- Reservation route uses `origin` only to choose `baseUrl` for links; allowed origins are fixed (`localhost:3000`, `terracotta-acton.com`). No broad CORS relaxation found.
- Next.js default CORS applies; no custom per-route CORS that would expose APIs inappropriately.

---

## 7. Sensitive data & logging

- No logging of passwords or full tokens.
- `console.info` used only for “email captured” when SMTP is unset (no sensitive payload).
- Error responses are generic (“Invalid credentials”, “Failed to process reservation”). No stack traces or internal details in API responses.

---

## 8. Dependencies

- Run `npm audit` and address reported vulnerabilities.
- Keep Next.js and Node within supported versions.

---

## 9. Checklist of recommended actions

1. **Critical:** Remove hardcoded default for `CRM_SECRET`/`ADMIN_SECRET` in production; require env. → **Done.** Default only in non-production; middleware and auth reject when secret is empty.
2. **Critical:** Remove hardcoded defaults for `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `DEVELOPER_PASSWORD` in production; require env and fail login if missing. → **Done.** Login and verify-reveal return 503 if env unset in production.
3. **Critical:** Sign reservation confirmation token (HMAC of payload) and verify signature in confirm route before using payload. → **Done.** `_confirmToken.ts` signs with HMAC-SHA256; confirm route accepts only signed tokens (no legacy unsigned).
4. **High:** Add rate limiting to `POST /api/reservation` and `POST /api/contact`. → **Done.** In-memory per-IP limits added (see below).
5. **Medium:** Consider short-lived, single-use tokens for reject links (e.g. signed token instead of raw `queueId` in URL) to reduce impact of link leakage. → Deferred.
6. **Low:** Document required env vars (including `CRM_SECRET`, `ADMIN_*`, `DEVELOPER_PASSWORD`) in README or `.env.example`. → **Done.** `.env.example` added.

---

## 10. Rate limiting (implemented)

- **Reservation:** `POST /api/reservation` — 10 requests per IP per 60 seconds.
- **Contact:** `POST /api/contact` — 10 requests per IP per 60 seconds.

Implemented in `app/api/_rateLimit.ts` (in-memory map; resets on restart). Returns 429 when exceeded. For multi-instance or persistent limits, use Redis or a dedicated rate-limit service.

---

## 11. Environment variables (production)

Set these in production (e.g. in your host’s env or `.env.production`). Do not rely on defaults.

| Variable | Required (prod) | Description |
|----------|-----------------|-------------|
| `CRM_SECRET` | Yes | Long random secret (≥32 chars) for signing CRM session cookies and confirmation tokens. |
| `ADMIN_USERNAME` | Yes | CRM admin login username. |
| `ADMIN_PASSWORD` | Yes | CRM admin login password. |
| `DEVELOPER_PASSWORD` | Yes | CRM developer login password (for developer tools). |
| `NEXT_PUBLIC_BASE_URL` | Recommended | Base URL for confirmation/reject links (e.g. `https://terracotta-acton.com`). |
| `OWNER_EMAIL` | Yes (for email) | Address that receives reservation and contact form emails. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | Yes (for email) | SMTP credentials for sending mail. |
| `ADMIN_SECRET` | Optional | Legacy alias for `CRM_SECRET` if you already use it. |

Optional: `MOCK_NO_EMAIL=true` to disable sending emails (e.g. local testing). An `env.example` file is in the project root (copy to `.env.local` and fill in).

---

## 12. Data retention (2 months)

- **Reservations:** Records with `date` older than 60 days are removed on next read (lazy cleanup in `_store.readAll`).
- **Queue:** Entries with `addedAt` older than 60 days are removed on next read (`_queue.readQueue`).
- **Alternatives:** Entries with `createdAt` older than 60 days are removed on next read (`_alternatives.readAlternatives`).
- **Cancellations:** Records with `cancelledAt` older than 60 days are removed on next read (`_store.readCancellations`).

Configured in `app/api/reservation/_retention.ts` (`RETENTION_DAYS = 60`). No hardcoded defaults remain for auth, base URL, or owner email; all are env-only and required when used (503 if missing).
