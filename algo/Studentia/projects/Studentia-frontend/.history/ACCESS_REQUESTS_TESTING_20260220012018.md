# Access Requests UI Tester (Frontend)

This page explains how to test the new Access Requests frontend component connected to backend APIs.

## Where the component is
- UI component: `src/components/AccessRequests.tsx`
- Wired in home screen: `src/Home.tsx`
- Button label: **Access Requests (test)**

## What it can do
- Create a pending access request
- Refresh student inbox
- Refresh requester-side list
- Approve request (triggers on-chain `grant_consent` via backend)
- Reject request

## Required backend endpoints
The component calls:
- `POST /access-requests`
- `GET /access-requests/student/:studentId`
- `GET /access-requests/requester/:requesterGroup`
- `POST /access-requests/:id/approve`
- `POST /access-requests/:id/reject`

## Expected request/response examples

### 1) Create request
**Request body**
```json
{
  "studentId": "student-001",
  "requesterGroup": "Recruiters",
  "dataGroup": "Portfolio",
  "purpose": "Screening"
}
```

**Response**
```json
{
  "ok": true,
  "request": {
    "id": "67b8...",
    "studentId": "student-001",
    "requesterGroup": "Recruiters",
    "dataGroup": "Portfolio",
    "purpose": "Screening",
    "status": "pending",
    "createdAt": "2026-02-20T..."
  }
}
```

### 2) Approve request
**Response**
```json
{
  "ok": true,
  "request": {
    "id": "67b8...",
    "status": "approved",
    "approvedTxId": "ABC...",
    "approvedReturnValue": "GRANTED:student-001:Recruiters:Portfolio"
  }
}
```

### 3) Reject request
**Request body**
```json
{ "reason": "Not required" }
```

**Response**
```json
{
  "ok": true,
  "request": {
    "id": "67b8...",
    "status": "rejected",
    "rejectReason": "Not required"
  }
}
```

## Setup
1. Ensure backend is running at `VITE_API_BASE` (usually `http://localhost:3000`).
2. Ensure frontend `.env` contains:
   - `VITE_API_BASE=http://localhost:3000`
   - `VITE_API_TOKEN=...` only if backend auth is enabled.
3. Start frontend and backend.

## UI test flow (quick)
1. Open home page.
2. Click **Access Requests (test)**.
3. Fill student/requester/data/purpose and click **Create request**.
4. Click **Refresh student inbox** and copy the returned request ID.
5. Paste ID into Request ID input.
6. Click **Approve request**.
7. Confirm status turns `approved` and tx appears.
8. Optionally create another request and click **Reject request**.

## Troubleshooting
- If button is disabled: set `VITE_API_BASE` in frontend `.env`.
- If 401: auth/token mismatch (only relevant if backend auth enabled).
- If approve fails with chain errors: check LocalNet + backend env (`APP_ID`, `ALGOD_*`, signer mnemonic).
- If no records show: verify `studentId` and `requesterGroup` values are exactly the same as create step.
