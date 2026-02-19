# Task: Run and validate Studentia backend

## Goal
Set up the consent backend locally, run it against Algorand LocalNet (or Testnet if configured), and verify the grant/revoke/read flows end-to-end.

## Deliverables
- Backend running locally with a valid `.env` (kept local, not committed).
- Evidence that `/health`, `/consents/grant`, `/consents/revoke`, and `/consents/:studentId` work (terminal logs or Postman screenshots are fine).
- Notes on any issues hit and how you resolved them.

## Prerequisites
- Node.js 18+ and npm.
- Algokit CLI installed (for LocalNet) or access to an Algorand node endpoint (Testnet via Algonode is fine).
- Repo already checked out; you are in `projects/Studentia-backend`.

## Steps
1) **Install deps**
   ```sh
   cd projects/Studentia-backend
   npm install
   ```

2) **Start Algorand network**
   - For LocalNet: in VS Code run task "Start AlgoKit LocalNet" (or `algokit localnet start`).
   - Ensure you have a funded account for signing (mnemonic in next step).

3) **Create .env** (in `projects/Studentia-backend/.env`)
   ```ini
   APP_ID=1002                     # 1002 for LocalNet deploy; replace if you redeploy
   ALGOD_SERVER=http://localhost
   ALGOD_PORT=4001
   ALGOD_TOKEN=a-l-g-o-k-i-t      # LocalNet token; leave blank for Algonode
   SIGNER_MNEMONIC="word1 word2 ... word25"
   DATA_ENC_KEY=base64-32-byte-key-here   # optional
   API_TOKEN=devtoken                     # optional bearer
   API_PORT=3000                          # optional
   ```
   - If using Testnet, switch ALGOD_* to Algonode Testnet and use a Testnet-funded signer.

4) **Run the backend (dev)**
   ```sh
   npm run dev
   ```
   - Server should log `API listening on port ...`.

5) **Health check**
   ```sh
   curl http://localhost:3000/health
   ```
   Expect `{ "ok": true }`.

6) **Grant consent (sample)**
   ```sh
   curl -X POST http://localhost:3000/consents/grant \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer devtoken" \ # remove if API_TOKEN not set
     -d '{
       "studentId": "student-001",
       "receiverGroup": "org-A",
       "dataGroup": "transcripts",
       "dataBlob": "optional-blob"
     }'
   ```
   - Expect JSON with `txId` and `returnValue`.

7) **Revoke consent (sample)**
   ```sh
   curl -X POST http://localhost:3000/consents/revoke \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer devtoken" \ # remove if API_TOKEN not set
     -d '{
       "studentId": "student-001",
       "receiverGroup": "org-A",
       "dataGroup": "transcripts"
     }'
   ```
   - Expect JSON with `txId` and `returnValue`.

8) **Read consents for a student**
   ```sh
   curl http://localhost:3000/consents/student-001 \
     -H "Authorization: Bearer devtoken"
   ```
   - Should show in-memory records (cleared on restart).

9) **(Optional) Frontend integration**
   - In `projects/Studentia-frontend/.env`, set `VITE_API_BASE=http://localhost:3000` (and `VITE_API_TOKEN=devtoken` if using auth), then `pnpm dev` or `npm run dev` there. The UI will call the backend instead of wallet signing.

10) **(Optional) Build for prod**
    ```sh
    npm run build
    ```
    - Outputs to `dist/`; `npm start` will run it.

11) **Report back**
    - Share the commands you ran, outputs (txIds), and any blockers. If Algorand calls fail, capture the error text from the dev console.

## Troubleshooting quick notes
- If `ENOENT algod` or network errors: confirm LocalNet is running or ALGOD_* envs point to a reachable node.
- If auth fails: check `API_TOKEN` matches your header and has no quotes in `.env`.
- If TypeScript compile issues on build: run `npm install` again to ensure node_modules is present.
- If mnemonics fail: ensure the account is funded on the selected network.
