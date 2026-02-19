# Frontend Handoff (LocalNet ready)

Audience: teammate taking over UI/UX and adding state (Zustand) while keeping the current flow working.

## Current backend / contract facts
- Contract App ID (LocalNet): **1013**. If you redeploy, update the App ID in envs below.
- Backend runs on `http://localhost:3000` (Node/Express). Uses bearer auth if `API_TOKEN` is set.
- Endpoints (all JSON):
  - `POST /consents/grant` body `{ studentId, receiverGroup, dataGroup, dataBlob? }` → `{ ok, txId, returnValue }`
  - `POST /consents/revoke` body `{ studentId, receiverGroup, dataGroup }` → `{ ok, txId, returnValue }`
  - `GET /consents/:studentId` → `{ ok, records: [...] }`
  - `GET /consents/onchain/:studentId/:receiverGroup/:dataGroup` → exact tuple status from chain
  - `GET /consents/onchain/:studentId` → bulk on-chain statuses for known tuples
- Auth header when enabled: `Authorization: Bearer <API_TOKEN>`

## Frontend env for LocalNet
Create `projects/Studentia-frontend/.env` (or `.env.local`) with:
```
VITE_API_BASE=http://localhost:3000
VITE_API_TOKEN=devtoken          # omit if API has no auth
VITE_APP_ID=1013                 # optional, if you display it in UI
```
Then install and run:
```
pnpm install   # or npm install
docker ps      # ensure LocalNet is up (algokit localnet start)
pnpm dev       # or npm run dev
```

## Minimal UX requirements to keep
- Keep a simple form with fields: `studentId`, `receiverGroup`, `dataGroup`, optional `dataBlob`.
- Buttons: "Grant" and "Revoke"; calls the backend endpoints above.
- Show last response: `txId`, `returnValue`, and any error message.
- Show current status fetched via `GET /consents/:studentId` after actions.
- Link to AlgoExplorer LocalNet or show the txId plainly (LocalNet may not have explorer; just show txId text).

## Suggested Zustand shape (you can refine)
```ts
interface ConsentState {
  studentId: string;
  receiverGroup: string;
  dataGroup: string;
  dataBlob?: string;
  loading: boolean;
  lastTxId?: string;
  lastReturn?: string;
  error?: string;
  records: Array<{ studentId: string; receiverGroup: string; dataGroup: string; status: string; ts?: string }>;
  setField: (k: string, v: string) => void;
  grant: () => Promise<void>;
  revoke: () => Promise<void>;
  refresh: (studentId: string) => Promise<void>;
}
```
Use fetch with `VITE_API_BASE` and optional `VITE_API_TOKEN`. Centralize headers in one helper so switching networks/tokens is easy.

## API helper sketch
```ts
const API_BASE = import.meta.env.VITE_API_BASE;
const API_TOKEN = import.meta.env.VITE_API_TOKEN;

const headers = (json = true) => ({
  ...(json ? { 'Content-Type': 'application/json' } : {}),
  ...(API_TOKEN ? { Authorization: `Bearer ${API_TOKEN}` } : {}),
});

async function post(path: string, body: unknown) {
  const res = await fetch(`${API_BASE}${path}`, { method: 'POST', headers: headers(true), body: JSON.stringify(body) });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function get(path: string) {
  const res = await fetch(`${API_BASE}${path}`, { headers: headers(false) });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
```

## Styling guidance
- Keep it clean/minimal for now: one column, labeled inputs, clear error/success areas.
- Do not over-style; teammate will replace with richer UI/UX later.
- Keep copy concise: "Grant consent" / "Revoke consent" / "Status" / "Last transaction".

## What to verify locally
1) Frontend loads and reads env vars.
2) Grant call returns `txId` and `GRANTED:...` (LocalNet needs backend running with valid signer mnemonic).
3) Revoke call returns `txId` and `REVOKED:...`.
4) Status reflects latest state after each action.
5) On-chain refresh shows `granted/revoked/none` from `/consents/onchain/:studentId`.

## API examples
- See backend API guide: `projects/Studentia-backend/API_REFERENCE.md`

## If backend auth or network changes
- Auth off: remove `VITE_API_TOKEN` and stop sending the header.
- Testnet move: update `APP_ID` in backend `.env`, redeploy contract, point frontend to the deployed backend (or enable direct wallet mode if you add it). Keep LocalNet instructions above for baseline.

## Handoff notes
- Your scope: improve UX, add Zustand, keep API contract intact.
- Avoid changing request shapes; backend already wired to on-chain App ID 1013 (LocalNet). If you change backend or redeploy contract, update `VITE_APP_ID` for display only.
- Keep error messages visible; don’t swallow backend text responses.
