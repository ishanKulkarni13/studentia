/**
 * Main entry point for the Studentia Backend API.
 * This Express.js server provides endpoints for managing consent grants and revokes on the Algorand blockchain.
 * It supports optional authentication via bearer tokens and AES-GCM encryption for stored data.
 *
 * Environment Variables:
 * - API_PORT: Port to listen on (default: 3000)
 * - API_TOKEN: Bearer token for authentication (optional; if not set, routes are open)
 */

import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import bearer from 'passport-http-bearer'
import passport from 'passport'
import { consentsRouter } from './routes/consents.js'
import { documentsRouter } from './routes/documents.js'
import { accessRequestsRouter } from './routes/accessRequests.js'
import { connectMongo } from './utils/db.js'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

// Disable bearer auth for now (open routes). To re-enable: set API_TOKEN and swap maybeAuth to passport.authenticate.
const maybeAuth = (_req: any, _res: any, next: any) => next()

app.get('/health', (_req, res) => res.json({ ok: true }))
app.use('/consents', maybeAuth, consentsRouter)
app.use('/documents', maybeAuth, documentsRouter)
app.use('/access-requests', maybeAuth, accessRequestsRouter)

const port = Number(process.env.API_PORT || 3000)

async function start() {
  await connectMongo()
  app.listen(port, () => {
    console.log(`API listening on :${port}`)
  })
}

start().catch((err) => {
  console.error('Failed to start API', err)
  process.exit(1)
})
