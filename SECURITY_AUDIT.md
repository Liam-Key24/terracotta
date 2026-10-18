# Security Audit – Terracotta

**Date:** 2026-10-18  
**Scope:** App (Next.js), API routes, CRM auth, reservation/contact flows, file/Upstash storage.

**Security rating: 8.5 / 10**

| What’s strong | What’s still limited |
|---------------|----------------------|
| No hardcoded secrets or login defaults; env required (503 if missing). | Alternative-offer flow still CRM-oriented when used. |
| Confirm **and** decline links use HMAC-SHA256 signed, expiring tokens; intentional POST required. | CSP allows `'unsafe-inline'` / `'unsafe-eval'` for Next.js practicality. |
| CRM login: Origin/Referer check, failed-login rate limit (5/15m), timing-safe compares. | Login Origin allowlist is host-based (must keep `NEXT_PUBLIC_BASE_URL` accurate). |
| Public POST rate limits on reservation/contact via Upstash (in-memory fallback). | `npm audit`: 5 high on `braces` via `eslint-config-next` (dev-only; no patched release yet). |
| Security headers: nosniff, Referrer-Policy, frame denial, CSP. | |
| Session cookie: httpOnly, secure in prod, sameSite, HMAC-signed; middleware checks role. | |
| Input validation, length clamping, HTML escaping in email/output. | |

---

## Executive summary

- **Addressed (2026-10):** Decline links use signed tokens with GET prompt + POST decline (replay-safe). CRM login hardened (Origin, rate limit, timing-safe). Public rate limits moved to Upstash when configured. Security headers added. Timing-safe compares for cookies/passwords. Guest “fully booked” email copy/date formatting updated.
- **Addressed (earlier):** Env-only secrets; confirm token HMAC; contact/reservation rate limits; 2-month retention.

---

## 1. Authentication & session (CRM)

| Finding | Severity | Details |
|--------|----------|---------|
| **Secret from env only** | OK | `auth.ts` / `middleware.ts` use `CRM_SECRET ?? ADMIN_SECRET`; empty → no signing / 503. |
| **Login Origin check** | OK | `POST /api/crm/login` rejects Origin/Referer outside allowlist (site + localhost). |
| **Login rate limit** | OK | 5 failed attempts / 15 minutes per IP+username (Upstash or memory); 429 + logged. |
| **Timing-safe compares** | OK | Passwords and cookie HMAC signatures use constant-time compares. |
| **Cookie settings** | OK | `httpOnly`, `secure` in production, `sameSite: 'lax'`, 24h. |
| **Middleware role check** | OK | Session must be `admin` or `developer` (matches `requireAuth`). |

---

## 2. Reservation confirmation & decline tokens

| Finding | Severity | Details |
|--------|----------|---------|
| **Confirm token** | OK | HMAC-SHA256, 48h expiry, purpose `confirm`; GET prompt, POST approves. |
| **Decline token** | OK | Same scheme with purpose `decline`; GET prompt, POST declines + guest email. |
| **Replay** | OK | Queue removal makes replay return 404 already processed. |

---

## 3. Rate limiting & DoS

| Finding | Severity | Details |
|--------|----------|---------|
| **Public POSTs** | OK | Reservation + contact: 10 / 60s per client IP via Upstash (`tc:ratelimit:*`), memory fallback. |
| **Client IP** | OK | Prefers `x-real-ip` / rightmost forwarded hop (not leftmost spoofable value alone). |

---

## 4. Security headers

Set in `next.config.ts` for all routes: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`, CSP with `frame-ancestors 'none'`.

---

## 5. Checklist

1. Env-only secrets → **Done**
2. Confirm token signed → **Done**
3. Decline token signed + intentional POST → **Done** (2026-10)
4. Public rate limits → **Done** (Upstash when configured)
5. Login Origin + fail rate limit + timing-safe → **Done** (2026-10)
6. Security headers → **Done** (2026-10)
7. Dependency upgrades → **Done** for Next 16.4.2 + nodemailer 10.1.6. Remaining `npm audit` highs: see §5a.

---

## 5a. npm audit (known leftover)

| Item | Status |
|------|--------|
| **nodemailer** | Cleared on **10.1.6** (SMTP/header injection class of issues). |
| **braces ≤ 3.0.3** ([GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm)) | **Accepted for now.** Pulled only by `eslint-config-next` → `@next/eslint-plugin-next` → `fast-glob` → `micromatch`. Dev/lint dependency, not production runtime. |
| **Why not `npm audit fix --force`** | Force-installs `eslint-config-next@14.2.35`, mismatches Next 16, breaks ESLint flat config, and swaps in other highs (`glob`). No `braces` release newer than 3.0.3 (`first_patched_version: null`). |
| **Follow-up** | Re-run `npm audit` when `braces` ships a patch, then prefer a normal bump / optional `overrides` — do **not** force-downgrade eslint-config-next. |

---

## 6. Environment variables (production)

| Variable | Required (prod) | Description |
|----------|-----------------|-------------|
| `CRM_SECRET` | Yes | ≥32 chars; cookies + confirm/decline tokens. |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Yes | CRM admin login. |
| `DEVELOPER_PASSWORD` | Yes | Developer login / reveal. |
| `NEXT_PUBLIC_BASE_URL` | Yes | Links + login Origin allowlist. |
| `OWNER_EMAIL` + SMTP_* | Yes (email) | Outbound mail. |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Strongly recommended | Shared queue/reservations + rate limits. |

Optional: `MOCK_NO_EMAIL=true`, `MAINTENANCE_MODE=true`. See `env.example`.

---

## 7. Data retention (2 months)

Lazy cleanup on read for reservations, queue, alternatives, cancellations (`RETENTION_DAYS = 60`).
