# Backend Validation Progress

This document tracks the step-by-step validation of the Studentia backend as per task.md.

## Step 1: Install Dependencies
- Command: `npm install`
- Status: Completed (assumed already installed or run manually)
- Output/Notes: Dependencies installed successfully.

## Step 2: Start Algorand Network
- Command: `algokit localnet start` (via VS Code task)
- Status: Pending
- Output/Notes:

## Step 3: Create .env File
- Status: Completed
- Content:
  ```
  APP_ID=1002
  ALGOD_SERVER=http://localhost
  ALGOD_PORT=4001
  ALGOD_TOKEN=a-l-g-o-k-i-t
  SIGNER_MNEMONIC="word1 word2 ... word25"
  DATA_ENC_KEY=base64-32-byte-key-here
  API_TOKEN=devtoken
  API_PORT=3000
  ```
  Note: SIGNER_MNEMONIC is placeholder; needs to be replaced with a funded LocalNet account mnemonic.

## Step 4: Run Backend (Dev)
- Command: `npm run dev`
- Status: Pending
- Output/Notes:

## Step 5: Health Check
- Command: `curl http://localhost:3000/health`
- Status: Pending
- Output/Notes:

## Step 6: Grant Consent (Sample)
- Command: curl POST to /consents/grant
- Status: Pending
- Output/Notes:

## Step 7: Revoke Consent (Sample)
- Command: curl POST to /consents/revoke
- Status: Pending
- Output/Notes:

## Step 8: Read Consents
- Command: curl GET /consents/student-001
- Status: Pending
- Output/Notes:

## Step 9: Optional Frontend Integration
- Status: Pending
- Output/Notes:

## Step 10: Optional Build for Prod
- Command: `npm run build`
- Status: Pending
- Output/Notes:

## Step 11: Report Back
- Status: Pending
- Summary:
