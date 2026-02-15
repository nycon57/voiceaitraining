/**
 * Custom Node.js server that wraps Next.js and adds WebSocket support.
 *
 * WebSocket connections to /api/copilot/stream are intercepted at the HTTP
 * upgrade level (before they reach Next.js route handlers). All other
 * requests are passed through to Next.js unchanged.
 *
 * Usage:
 *   Development:  pnpm dev:ws   (WebSocket + Next.js, no HMR)
 *   Production:   pnpm start:ws (WebSocket + Next.js)
 *
 * For normal development with HMR (no WebSocket), use: pnpm dev
 */

import { createServer } from 'http'
import { parse } from 'url'

import next from 'next'
import { WebSocketServer } from 'ws'

const dev = process.env.NODE_ENV !== 'production'
const hostname = process.env.HOSTNAME || '0.0.0.0'
const port = parseInt(process.env.PORT || '3000', 10)

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()
const upgradeHandler = app.getUpgradeHandler()

await app.prepare()

const server = createServer((req, res) => {
  const parsedUrl = parse(req.url ?? '/', true)
  handle(req, res, parsedUrl)
})

// WebSocket server — no HTTP server of its own; we handle upgrades manually
const wss = new WebSocketServer({ noServer: true })

// Allowed origins for WebSocket upgrade requests.
// In production, set WS_ALLOWED_ORIGINS as a comma-separated list of origins.
function normalizeOrigin(raw) {
  if (!raw || typeof raw !== 'string') return null
  const trimmed = raw.trim()
  if (!trimmed) return null
  try {
    return new URL(trimmed).origin.toLowerCase()
  } catch {
    return trimmed.toLowerCase().replace(/\/+$/, '')
  }
}

const ALLOWED_ORIGINS = (process.env.WS_ALLOWED_ORIGINS || '')
  .split(',')
  .map((o) => normalizeOrigin(o))
  .filter(Boolean)

function isOriginAllowed(origin) {
  if (ALLOWED_ORIGINS.length === 0 && dev) return true // permissive in dev only
  const normalized = normalizeOrigin(origin)
  if (!normalized) return false
  return ALLOWED_ORIGINS.includes(normalized)
}

server.on('upgrade', (req, socket, head) => {
  const { pathname } = parse(req.url ?? '/', true)

  if (pathname === '/api/copilot/stream') {
    const origin = req.headers.origin
    if (!origin || !isOriginAllowed(origin)) {
      socket.write('HTTP/1.1 403 Forbidden\r\n\r\n')
      socket.destroy()
      return
    }

    wss.handleUpgrade(req, socket, head, async (ws) => {
      const { handleCopilotConnection } = await import(
        './src/lib/copilot/ws-handler.ts'
      )
      handleCopilotConnection(ws, req)
    })
    return
  }

  // Pass all other upgrade requests to Next.js (HMR in dev, etc.)
  upgradeHandler(req, socket, head)
})

server.listen(port, hostname, () => {
  console.log(`> Ready on http://${hostname}:${port}`)
  console.log(`> WebSocket copilot endpoint: ws://${hostname}:${port}/api/copilot/stream`)
})
