# Document Upload Tester (Frontend)

This guide explains how to test the new document upload/share/download flow from the frontend.

## Component location
- UI component: `src/components/DocumentUploads.tsx`
- Home wiring: `src/Home.tsx`
- Button label: **Documents Upload (test)**

## Backend endpoints used
- `POST /documents/upload`
- `GET /documents/:studentId`
- `POST /documents/:id/share`
- `GET /documents/download/:id?ownerStudentId=...&requesterGroup=...`

## Prerequisites
1. Backend running at `VITE_API_BASE` (usually `http://localhost:3000`).
2. LocalNet running and backend env configured (`APP_ID`, `ALGOD_*`, `SIGNER_MNEMONIC`, `MONGODB_URI`).
3. Frontend `.env` has:
   - `VITE_API_BASE=http://localhost:3000`
   - `VITE_API_TOKEN=...` only if backend auth is enabled.

## UI flow
1. Open app.
2. Click **Documents Upload (test)**.
3. Fill:
   - `studentId`
   - `receiverGroup`
   - `dataGroup`
4. Choose file via file picker.
5. Click **Upload document**.
6. Click **Refresh documents** (or it auto-refreshes after upload).
7. Copy a document ID from list.
8. Paste into **Document ID**.
9. Click **Share document** (requires on-chain consent granted for student+receiver+dataGroup).
10. Click **Download payload** to fetch file base64 and preview.

## Expected responses (examples)

### Upload success
```json
{
  "ok": true,
  "document": {
    "id": "67b8...",
    "studentId": "student-001",
    "receiverGroup": "Recruiters",
    "dataGroup": "Portfolio",
    "fileName": "resume.pdf",
    "mimeType": "application/pdf",
    "sizeBytes": 23456,
    "storageMode": "encrypted",
    "sharedWith": []
  }
}
```

### Share success
```json
{
  "ok": true,
  "id": "67b8...",
  "sharedWith": ["Recruiters"],
  "onChainStatus": "granted"
}
```

### Download success
```json
{
  "ok": true,
  "document": {
    "id": "67b8...",
    "fileName": "resume.pdf",
    "mimeType": "application/pdf"
  },
  "fileBase64": "JVBERi0xLjc...",
  "accessMode": "shared"
}
```

## Common errors
- `consent not granted on-chain for this receiver/data group`:
  - Grant consent first from the Consent modal for same student/receiver/dataGroup.
- `document not shared with this group`:
  - Share document first or use owner mode (empty requester group).
- `Expected JSON but got text/html`:
  - Backend route mismatch/stale process. Restart backend and verify `/documents/:studentId` in browser/Postman.
