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
import { consentsRouter } from './routes/consents'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

// Simple bearer token auth (set API_TOKEN in env)
const apiToken = process.env.API_TOKEN || ''
passport.use(
  new bearer.Strategy((token, done) => {
    if (apiToken && token === apiToken) return done(null, { token })
    return done(null, false)
  })
)

// Protect routes if API_TOKEN is set; otherwise allow open (hackathon-friendly)
const maybeAuth = apiToken ? passport.authenticate('bearer', { session: false }) : (_req: any, _res: any, next: any) => next()

app.get('/health', (_req, res) => res.json({ ok: true }))
app.use('/consents', maybeAuth, consentsRouter)

const port = Number(process.env.API_PORT || 3000)
app.listen(port, () => {
  console.log(`API listening on :${port}`)
})
