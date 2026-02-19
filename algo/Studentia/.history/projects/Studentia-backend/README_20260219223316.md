# Studentia Backend (Consent)

Minimal Express + TypeScript API for consent grant/revoke with Algorand app calls and optional AES-GCM encryption.

## Env vars
- `APP_ID` (required): Algorand app ID
- `ALGOD_SERVER` / `ALGOD_PORT` / `ALGOD_TOKEN` (required): Algod endpoint (e.g., Testnet Algonode)
- `SIGNER_MNEMONIC` (required): account that signs app calls
- `DATA_ENC_KEY` (optional): base64 32-byte key for AES-GCM encrypting stored blobs
- `API_TOKEN` (optional): bearer token to protect the API
- `API_PORT` (optional): default 3000

## Install & run
```sh
cd projects/Studentia-backend
npm install
npm run dev
```

## API
- `GET /health`
- `POST /consents/grant` body `{ studentId, receiverGroup, dataGroup, dataBlob? }`
- `POST /consents/revoke` body `{ studentId, receiverGroup, dataGroup }`
- `GET /consents/:studentId`

Auth: if `API_TOKEN` is set, pass `Authorization: Bearer <API_TOKEN>`.

## Test quick
1) Set env (APP_ID, ALGOD_* , SIGNER_MNEMONIC, DATA_ENC_KEY).
2) `npm run dev`.
3) In Postman:
   - POST http://localhost:3000/consents/grant with JSON body and bearer if enabled.
   - Expect `txId` in response.
4) GET http://localhost:3000/consents/<studentId> to see stored records.

## Frontend wiring
- Set `VITE_API_BASE=http://localhost:3000` (and `VITE_API_TOKEN` if used) in Studentia-frontend `.env`.
- Frontend AppCalls will use the backend when `VITE_API_BASE` is present.
