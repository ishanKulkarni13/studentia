# Frontend Integration Guide: Data Group File Flow

This guide documents the backend-only flow implemented for:

1. Student selects a data group while uploading a file
2. File is uploaded and stored
3. Student can see uploaded files (flat + grouped views)

Base URL (local): `http://localhost:3000`

## Overview

- Data groups are validated server-side during upload.
- Default data groups are always available per student:
  - `Academics`
  - `Portfolio`
  - `Personal`
- Students can create custom data groups via API before upload.
- Upload fails if `dataGroup` is not a default group and not a student-created custom group.

## 1) List available data groups for student

`GET /data-groups/:studentId`

Example:

`GET /data-groups/student-001`

Example response:

```json
{
  "ok": true,
  "studentId": "student-001",
  "dataGroups": [
    {
      "id": "default:academics",
      "studentId": "student-001",
      "name": "Academics",
      "isCustom": false,
      "createdAt": null
    },
    {
      "id": "default:portfolio",
      "studentId": "student-001",
      "name": "Portfolio",
      "isCustom": false,
      "createdAt": null
    },
    {
      "id": "default:personal",
      "studentId": "student-001",
      "name": "Personal",
      "isCustom": false,
      "createdAt": null
    },
    {
      "id": "67ca...",
      "studentId": "student-001",
      "name": "Research",
      "isCustom": true,
      "createdAt": "2026-02-20T10:20:30.000Z"
    }
  ]
}
```

## 2) Create a custom data group (optional)

`POST /data-groups`

Body:

```json
{
  "studentId": "student-001",
  "name": "Research"
}
```

Validation rules:

- `name` length must be 2..64 characters.
- Group names are unique per student (case-insensitive).
- If `name` is one of default groups, API returns success with default group metadata.

## 3) Upload file with selected data group

### A) Multipart upload (recommended)

`POST /documents/upload-form`

Form fields:

- `studentId`
- `receiverGroup`
- `dataGroup`
- `file`

Example cURL:

```bash
curl -X POST http://localhost:3000/documents/upload-form \
  -F "studentId=student-001" \
  -F "receiverGroup=Recruiters" \
  -F "dataGroup=Portfolio" \
  -F "file=@./resume.pdf"
```

### B) Base64 JSON upload

`POST /documents/upload`

Body:

```json
{
  "studentId": "student-001",
  "receiverGroup": "Recruiters",
  "dataGroup": "Portfolio",
  "fileName": "resume.pdf",
  "mimeType": "application/pdf",
  "fileBase64": "JVBERi0xLjc..."
}
```

### Invalid data group response

If selected group is invalid for the student:

```json
{
  "error": "invalid dataGroup for this student. Create custom groups via POST /data-groups first"
}
```

## 4) Show uploaded files (flat list)

`GET /documents/:studentId`

Example:

`GET /documents/student-001`

Returns all files with metadata, including `dataGroup`.

## 5) Show uploaded files grouped by data group

`GET /documents/:studentId/grouped`

Example:

`GET /documents/student-001/grouped`

Example response:

```json
{
  "ok": true,
  "studentId": "student-001",
  "totalDocuments": 3,
  "groups": [
    {
      "dataGroup": "Portfolio",
      "count": 2,
      "documents": [
        {
          "id": "67d1...",
          "studentId": "student-001",
          "receiverGroup": "Recruiters",
          "dataGroup": "Portfolio",
          "fileName": "resume.pdf",
          "mimeType": "application/pdf",
          "sizeBytes": 23456,
          "storageMode": "encrypted",
          "sharedWith": [],
          "createdAt": "2026-02-20T10:42:11.000Z"
        }
      ]
    },
    {
      "dataGroup": "Academics",
      "count": 1,
      "documents": [
        {
          "id": "67d2...",
          "studentId": "student-001",
          "receiverGroup": "College",
          "dataGroup": "Academics",
          "fileName": "transcript.pdf",
          "mimeType": "application/pdf",
          "sizeBytes": 54321,
          "storageMode": "encrypted",
          "sharedWith": [],
          "createdAt": "2026-02-20T10:51:27.000Z"
        }
      ]
    }
  ]
}
```

## 6) Existing Algorand consent behavior (unchanged)

- Share/download permissions still use on-chain consent checks via:
  - `POST /consents/grant`
  - `POST /consents/revoke`
  - `GET /consents/onchain/:studentId/:receiverGroup/:dataGroup`
- Backend verifies consent for document share/download where applicable.

## Suggested frontend implementation sequence

1. On upload screen load: call `GET /data-groups/:studentId`.
2. Render default + custom groups in the data-group selector.
3. If user enters custom group inline, call `POST /data-groups` first.
4. Submit file upload with selected `dataGroup`.
5. Refresh file list from `GET /documents/:studentId/grouped`.
6. Use grouped response for grouped UI sections, and flat response where needed.
