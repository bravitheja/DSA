# Google Sheets Sync Architecture

## Scope

This document captures the **current** sync approach used by this repo:

- Frontend: static app on GitHub Pages
- Auth bootstrap: Google Identity Services (GIS) in browser
- Sync backend: Google Apps Script Web App (`SyncWebApp.gs`)
- Storage: Google Sheet tabs (`Progress`, `GeneralNotes`)

It also lists production caveats and a recommended near-term hardening path.

## High-Level Architecture

```mermaid
flowchart LR
    U[User Browser<br/>GitHub Pages app] -->|GIS Sign-In| G[Google Identity Services]
    G -->|ID Token credential| U

    U -->|POST action + idToken + payload| A[Google Apps Script Web App<br/>SyncWebApp.gs]
    A -->|verifyIdToken via tokeninfo| O[Google OAuth tokeninfo]
    A -->|read/write| S[(Google Sheet<br/>Progress + GeneralNotes)]
    A --> U
```

## Runtime Request Flow

```mermaid
sequenceDiagram
    participant B as Browser (sync.js)
    participant GIS as Google Identity Services
    participant GAS as Apps Script (SyncWebApp)
    participant O as OAuth tokeninfo
    participant SH as Google Sheet

    B->>GIS: Sign in
    GIS-->>B: credential (Google ID token)
    B->>B: store token + local state keying

    Note over B: pull on init
    B->>GAS: POST { action: pullProgress, idToken }
    GAS->>O: verify idToken + aud check
    O-->>GAS: token claims (sub, aud, exp...)
    GAS->>SH: read rows for googleSub
    SH-->>GAS: rows
    GAS-->>B: { ok, rows }
    B->>B: merge by updatedAt (latest wins)

    Note over B: debounced push (4s)
    B->>GAS: POST { action: pushProgress, idToken, rows[] }
    GAS->>O: verify idToken
    GAS->>SH: upsert rows keyed by (googleSub, problemKey)
    GAS-->>B: { ok: true }
```

## Data Model (Sheet Tabs)

### `Progress` sheet

```mermaid
erDiagram
    PROGRESS {
      string googleSub
      string problemKey
      string status
      string notes
      string updatedAt
      string noteFlag
      string notesFormat
    }
```

Composite logical key: `googleSub + problemKey`

### `GeneralNotes` sheet

```mermaid
erDiagram
    GENERAL_NOTES {
      string googleSub
      string noteId
      string title
      string body
      string noteFlag
      string updatedAt
    }
```

Composite logical key: `googleSub + noteId`

## Local-First Sync Behavior

- App writes immediately to browser state (`localStorage`), then pushes in background.
- Dirty sets (`dirty`, `generalDirty`) are flushed on debounce and keepalive paths.
- Merge strategy is timestamp-based (`updatedAt`): newer record wins.
- Token-less mode uses signed-out storage keys; signed-in mode scopes by Google `sub`.

## Security and Validation in Apps Script

From `SyncWebApp.gs`:

- Validates Google ID token (`tokeninfo` endpoint + `aud` match with `GOOGLE_CLIENT_ID`).
- Uses `LockService` to avoid concurrent write corruption.
- Sanitizes:
  - `noteFlag` against allowlist
  - `notesFormat` (`html`/`markdown`)
  - formula-leading characters (`= + - @`) to prevent sheet formula injection
- Enforces max note/body length (`MAX_NOTE_CHARS`).

## Operational Characteristics

- Very low infra overhead (no dedicated server needed).
- Easy deploy/update via Apps Script web app versions.
- Best for small-to-medium personal/team workloads.

Trade-offs:

- Apps Script quotas/latency can become bottlenecks at scale.
- Browser-managed token/session is less robust than server refresh-session architecture.
- `tokeninfo` verification per request is simple but not optimal for high throughput.

## Current Endpoints/Actions

Single Apps Script `doPost` endpoint with actions:

- `pullProgress`
- `pushProgress`
- `pullGeneralNotes`
- `pushGeneralNotes`

Request contract:

```json
{
  "action": "pushProgress",
  "idToken": "<google-id-token>",
  "rows": []
}
```

## Recommended Hardening (Incremental)

1. Keep this architecture for now, but shorten client token lifetime behavior to true JWT `exp`.
2. Add a Cloud Run facade in front of Apps Script for:
   - rate limiting
   - centralized logs/alerts
   - future refresh-session migration
3. Migrate fully to Cloud Run + Firestore sessions when ready (see `docs/auth-session-refresh-plan.md`).

## Related Files

- `sync.js`
- `scripts/google-apps-script/SyncWebApp.gs`
- `docs/auth-session-refresh-plan.md`
