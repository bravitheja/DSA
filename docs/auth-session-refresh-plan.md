# Auth Session Refresh Plan (GitHub-Hosted Frontend + Google Cloud)

## Goal

Move from long-lived client-side token usage to a production-style session model:

- Keep frontend on GitHub Pages (static hosting)
- Keep access/ID tokens short-lived (about 1 hour or less)
- Add secure, automatic session renewal without forcing frequent re-login
- Use Google Cloud services for backend/session infrastructure

## Recommended Architecture

### 1) Frontend (GitHub Pages)

- Static app (current setup)
- Uses Google Sign-In only to bootstrap identity
- Never stores long-lived refresh secrets in `localStorage`
- Calls your backend for app session and refresh lifecycle

### 2) Backend (Google Cloud Run)

Single API service (`auth + sync`) deployed on Cloud Run:

- Verifies Google ID token during login
- Issues:
  - short-lived app access token (JWT, 10-30 min)
  - rotating refresh token (opaque random ID)
- Sets refresh token in secure cookie:
  - `HttpOnly`, `Secure`, `SameSite=Lax` (or `None` for cross-site needs)
- Exposes endpoints:
  - `POST /auth/login`
  - `POST /auth/refresh`
  - `POST /auth/logout`
  - existing sync endpoints (or proxy to Apps Script temporarily)

### 3) Token/Session Store (Firestore recommended)

Store refresh sessions in Firestore:

- `sessionId`, `userId`, `createdAt`, `expiresAt`
- `rotatedFrom`, `revokedAt`, `lastSeenAt`, `ipHash`, `uaHash`
- Supports refresh token rotation and replay detection

## Why this is best for your GitHub-hosted app

- GitHub Pages remains simple and cheap (no server migration needed)
- Secrets and refresh logic live on server-side only
- Better security than extending token validity in browser storage
- Scales with your current Google ecosystem and can integrate with your Sheets sync path

## Implementation Plan

## Phase 0 - Prep

1. Add GCP project resources:
   - Cloud Run service
   - Artifact Registry (if needed)
   - Firestore (native mode)
   - Secret Manager entries (`GOOGLE_CLIENT_ID`, signing keys)
2. Add custom API domain (optional but recommended):
   - `api.<your-domain>`
3. Configure CORS allowlist:
   - GitHub Pages origin(s) only

## Phase 1 - Auth Bootstrap

1. Keep current Google Sign-In button in frontend.
2. After GIS returns credential (`response.credential`):
   - Send to `POST /auth/login`.
3. Backend:
   - Verify Google token (`aud`, `iss`, `exp`, signature)
   - Upsert user profile
   - Create access token + refresh session
   - Set refresh cookie
   - Return short-lived access token JSON

## Phase 2 - Auto Refresh Flow

1. Frontend stores access token in memory (preferred) or session storage.
2. Add fetch wrapper:
   - Before request: if access token expiring soon (< 2 min), call `/auth/refresh`.
   - On `401`: call `/auth/refresh` once, retry original request once.
3. Add "single-flight" refresh lock:
   - Prevent multiple simultaneous refresh calls from racing.
4. `/auth/refresh` backend behavior:
   - Validate current refresh cookie in Firestore
   - Rotate token/session (invalidate old, create new)
   - Return new short-lived access token
   - Set new refresh cookie

## Phase 3 - Logout and Revocation

1. Frontend logout calls `POST /auth/logout`.
2. Backend revokes active refresh session in Firestore.
3. Backend clears refresh cookie.
4. Frontend clears in-memory access token and local view state if needed.

## Phase 4 - Hardening

1. Rotation + reuse detection:
   - If old refresh token reused, revoke session family and force re-login.
2. Session policy:
   - Idle timeout: 24h
   - Absolute max lifetime: 7-30 days
3. Security headers:
   - CSP, HSTS, `X-Content-Type-Options`
4. Monitoring:
   - Cloud Logging alerts for refresh failures/reuse attempts

## Phase 5 - Sync Endpoint Migration

You have two options:

- **Option A (recommended):** move sync logic from Apps Script to Cloud Run APIs.
- **Option B (incremental):** keep Apps Script temporarily and let Cloud Run proxy requests with validated user context.

Option A is cleaner and allows consistent auth/session enforcement.

## API Contract (Suggested)

### `POST /auth/login`

Request:

```json
{
  "googleIdToken": "<GIS credential JWT>"
}
```

Response:

```json
{
  "accessToken": "<short-lived-jwt>",
  "expiresIn": 900,
  "user": {
    "id": "google-sub",
    "email": "user@example.com",
    "name": "User"
  }
}
```

### `POST /auth/refresh`

Request body empty (uses refresh cookie).

Response:

```json
{
  "accessToken": "<new-short-lived-jwt>",
  "expiresIn": 900
}
```

### `POST /auth/logout`

Revokes current refresh session and clears cookie.

## Frontend Changes in This Repo

1. `sync.js`:
   - Keep GIS login
   - Replace local token aging logic with server-driven access token handling
   - Add refresh helper + retry wrapper
2. Add a small `auth-client.js` utility (optional):
   - `loginWithGoogleCredential()`
   - `getAccessToken()`
   - `refreshIfNeeded()`
   - `logout()`
3. Update existing sync API calls to include `Authorization: Bearer <accessToken>`.

## Security Notes

- Do not store refresh tokens in `localStorage`.
- Prefer memory-only access token storage to reduce XSS impact.
- Cookies must be `HttpOnly` and `Secure`.
- Keep CORS strict to your GitHub Pages URL.

## Delivery Sequence (Pragmatic)

1. Build Cloud Run auth endpoints + Firestore session table.
2. Integrate frontend login + refresh wrapper.
3. Keep existing data sync unchanged for one iteration.
4. Migrate sync APIs behind Cloud Run.
5. Remove old fallback token aging code.

## Estimated Effort

- Cloud Run auth service + Firestore sessions: 1-2 days
- Frontend refresh integration: 0.5-1 day
- Sync migration from Apps Script to Cloud Run: 1-2 days
- Hardening + testing: 1 day

## Decision

For your GitHub-hosted website, the best long-term approach is:

- **GitHub Pages frontend + Cloud Run auth/session API + Firestore rotating refresh sessions**.

This gives you real-world security and reliable auto login continuity without stretching token validity in browser storage.
