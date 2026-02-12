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

server.on('upgrade', (req, socket, head) => {
  const { pathname } = parse(req.url ?? '/', true)

  if (pathname === '/api/copilot/stream') {
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
