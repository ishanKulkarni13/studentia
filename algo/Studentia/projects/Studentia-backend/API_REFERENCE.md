# Studentia Consent API Reference

Base URL (local): `http://localhost:3000`

Auth:
- Currently auth is disabled in backend middleware for local development.
- If re-enabled later, send: `Authorization: Bearer <API_TOKEN>`.

## 1) Health
### Request
`GET /health`

### Example response
```json
{
  "ok": true
}
```

## 2) Grant consent
### Request
`POST /consents/grant`

Body:
```json
{
  "studentId": "student-001",
  "receiverGroup": "Recruiters",
  "dataGroup": "Portfolio",
  "dataBlob": "optional payload"
}
```

### Example response
```json
{
  "ok": true,
  "txId": "KQ6...ABC",
  "returnValue": "GRANTED:student-001:Recruiters:Portfolio"
}
```

## 3) Revoke consent
### Request
`POST /consents/revoke`

Body:
```json
{
  "studentId": "student-001",
  "receiverGroup": "Recruiters",
  "dataGroup": "Portfolio"
}
```

### Example response
```json
{
  "ok": true,
  "txId": "Y7T...XYZ",
  "returnValue": "REVOKED:student-001:Recruiters:Portfolio"
}
```

## 4) Backend in-memory records for a student
### Request
`GET /consents/:studentId`

### Example
`GET /consents/student-001`

### Example response
```json
{
  "ok": true,
  "records": [
    {
      "studentId": "student-001",
      "receiverGroup": "Recruiters",
      "dataGroup": "Portfolio",
      "status": "granted",
      "txId": "KQ6...ABC"
    }
  ]
}
```

## 5) On-chain status for one tuple
### Request
`GET /consents/onchain/:studentId/:receiverGroup/:dataGroup`

### Example
`GET /consents/onchain/student-001/Recruiters/Portfolio`

### Example response
```json
{
  "ok": true,
  "boxKey": "student-001:Recruiters:Portfolio",
  "status": "granted",
  "numeric": 1
}
```

Status meanings:
- `granted` → `numeric: 1`
- `revoked` → `numeric: 0`
- `none` → box missing

## 6) Bulk on-chain status for one student
### Request
`GET /consents/onchain/:studentId`

### Example
`GET /consents/onchain/student-001`

### Example response
```json
{
  "ok": true,
  "statuses": [
    {
      "studentId": "student-001",
      "receiverGroup": "Recruiters",
      "dataGroup": "Portfolio",
      "boxKey": "student-001:Recruiters:Portfolio",
      "status": "granted",
      "numeric": 1
    }
  ]
}
```

## PowerShell test commands
```powershell
# 1) Health
Invoke-WebRequest -Uri http://localhost:3000/health -UseBasicParsing | Select-Object -ExpandProperty Content

# 2) Grant
Invoke-WebRequest -Uri http://localhost:3000/consents/grant -Method POST -ContentType 'application/json' -Body '{"studentId":"student-001","receiverGroup":"Recruiters","dataGroup":"Portfolio"}' -UseBasicParsing | Select-Object -ExpandProperty Content

# 3) Revoke
Invoke-WebRequest -Uri http://localhost:3000/consents/revoke -Method POST -ContentType 'application/json' -Body '{"studentId":"student-001","receiverGroup":"Recruiters","dataGroup":"Portfolio"}' -UseBasicParsing | Select-Object -ExpandProperty Content

# 4) Backend records
Invoke-WebRequest -Uri http://localhost:3000/consents/student-001 -UseBasicParsing | Select-Object -ExpandProperty Content

# 5) On-chain exact tuple
Invoke-WebRequest -Uri http://localhost:3000/consents/onchain/student-001/Recruiters/Portfolio -UseBasicParsing | Select-Object -ExpandProperty Content

# 6) On-chain bulk
Invoke-WebRequest -Uri http://localhost:3000/consents/onchain/student-001 -UseBasicParsing | Select-Object -ExpandProperty Content
```

## Troubleshooting
- `Invalid API Token`: set backend `.env` `ALGOD_TOKEN` to LocalNet value.
- `invalid Box reference`: backend/frontend must send the same tuple values used for the box key.
- `Unable to connect`: backend not running on port 3000.
