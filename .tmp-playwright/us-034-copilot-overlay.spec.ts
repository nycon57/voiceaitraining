import { expect, test } from 'playwright/test'

test('US-034 copilot overlay interactions and realtime states', async ({ page }) => {
  await page.addInitScript(() => {
    let connectionCount = 0

    class MockWebSocket {
      static CONNECTING = 0
      static OPEN = 1
      static CLOSING = 2
      static CLOSED = 3

      url: string
      readyState = MockWebSocket.CONNECTING
      binaryType = 'blob'
      onopen: ((event: { type: string }) => void) | null = null
      onmessage: ((event: { data: string }) => void) | null = null
      onclose:
        | ((event: { code: number; reason: string; wasClean: boolean }) => void)
        | null = null

      constructor(url: string) {
        this.url = url
        connectionCount += 1
        const currentConnection = connectionCount

        const emitMessage = (payload: unknown) => {
          if (this.readyState !== MockWebSocket.OPEN) return
          this.onmessage?.({ data: JSON.stringify(payload) })
        }

        const openDelay = currentConnection === 1 ? 40 : 3000

        setTimeout(() => {
          this.readyState = MockWebSocket.OPEN
          this.onopen?.({ type: 'open' })

          emitMessage({
            type: 'connected',
            sessionId: `session-${currentConnection}`,
            sampleRate: 16000,
            channels: 1,
          })

          if (currentConnection !== 1) return

          setTimeout(() => {
            emitMessage({
              type: 'kpi',
              sessionId: 'session-1',
              kpis: {
                sessionId: 'session-1',
                talkRatio: 55,
                fillerCount: 2,
                fillerRatePerMinute: 1.8,
                paceWordsPerMinute: 145,
                questionsAsked: 2,
                turnCount: 4,
                userWordCount: 145,
                customerWordCount: 118,
                durationMs: 65000,
                noQuestionWindowMs: 0,
                deadAirMs: 500,
                hasSpeech: true,
                timestampMs: Date.now(),
              },
            })
          }, 120)

          setTimeout(() => {
            emitMessage({
              type: 'coaching',
              sessionId: 'session-1',
              suggestion: {
                id: 's1',
                type: 'objection',
                severity: 'warning',
                message: 'Price objection detected. Reinforce ROI and timeline value.',
                timestampMs: Date.now(),
              },
            })
          }, 180)

          setTimeout(() => {
            emitMessage({
              type: 'transcript',
              transcriptType: 'final',
              transcript: {
                sessionId: 'session-1',
                text: 'We can usually close implementation in two weeks.',
                speaker: 'user',
                speakerIndex: 0,
                user: true,
                isFinal: true,
                startMs: 1000,
                endMs: 5000,
                confidence: 0.94,
              },
            })
          }, 220)

          setTimeout(() => {
            emitMessage({
              type: 'transcript',
              transcriptType: 'final',
              transcript: {
                sessionId: 'session-1',
                text: 'That sounds expensive for our current budget.',
                speaker: 'customer',
                speakerIndex: 1,
                user: false,
                isFinal: true,
                startMs: 5500,
                endMs: 9200,
                confidence: 0.91,
              },
            })
          }, 300)

          setTimeout(() => {
            this.readyState = MockWebSocket.CLOSED
            this.onclose?.({ code: 1006, reason: 'mock disconnect', wasClean: false })
          }, 1300)
        }, openDelay)
      }

      send() {}

      close(code = 1000, reason = '') {
        this.readyState = MockWebSocket.CLOSED
        this.onclose?.({ code, reason, wasClean: true })
      }

      addEventListener(
        type: 'open' | 'message' | 'close',
        listener: ((event: unknown) => void) | null,
      ) {
        if (type === 'open') this.onopen = listener as (event: { type: string }) => void
        if (type === 'message')
          this.onmessage = listener as (event: { data: string }) => void
        if (type === 'close')
          this.onclose = listener as (event: {
            code: number
            reason: string
            wasClean: boolean
          }) => void
      }

      removeEventListener(
        type: 'open' | 'message' | 'close',
        listener: ((event: unknown) => void) | null,
      ) {
        if (type === 'open' && this.onopen === listener) this.onopen = null
        if (type === 'message' && this.onmessage === listener) this.onmessage = null
        if (type === 'close' && this.onclose === listener) this.onclose = null
      }
    }

    // @ts-expect-error runtime monkey patch for test scenario
    window.WebSocket = MockWebSocket
  })

  await page.goto('http://localhost:3007/demo-credentials?copilotPreview=1', {
    waitUntil: 'domcontentloaded',
  })

  const liveCopilotLabel = page.getByText('Live Copilot')
  await expect(liveCopilotLabel).toBeVisible()

  const before = await liveCopilotLabel.boundingBox()
  expect(before).not.toBeNull()

  if (!before) {
    throw new Error('Could not read initial bounding box')
  }

  await page.mouse.move(before.x + before.width / 2, before.y + before.height / 2)
  await page.mouse.down()
  await page.mouse.move(
    before.x + before.width / 2 - 120,
    before.y + before.height / 2 - 90,
    { steps: 12 },
  )
  await page.mouse.up()

  await page.waitForTimeout(200)

  const after = await liveCopilotLabel.boundingBox()
  expect(after).not.toBeNull()

  if (!after) {
    throw new Error('Could not read moved bounding box')
  }

  const dx = Math.abs(after.x - before.x)
  const dy = Math.abs(after.y - before.y)
  expect(dx > 40 || dy > 40).toBeTruthy()

  await expect(page.getByText('55%')).toBeVisible()
  await expect(page.getByText('145 wpm')).toBeVisible()
  await expect(page.getByText('1:05')).toBeVisible()

  await expect(
    page.getByText('Price objection detected. Reinforce ROI and timeline value.'),
  ).toBeVisible()

  await expect(page.getByText('You').first()).toBeVisible()
  await expect(page.getByText('Customer').first()).toBeVisible()
  await expect(
    page.getByText('We can usually close implementation in two weeks.'),
  ).toBeVisible()

  await expect(page.getByText('Reconnecting...').first()).toBeVisible({
    timeout: 10000,
  })

  await expect(page.locator('span', { hasText: '--' }).first()).toBeVisible({
    timeout: 10000,
  })

  await page.waitForTimeout(10500)
  await expect(
    page.getByText('Price objection detected. Reinforce ROI and timeline value.'),
  ).toHaveCount(0)

  await page.getByLabel('Minimize copilot').click()
  await expect(page.getByLabel('Expand copilot')).toBeVisible()

  await page.getByLabel('Expand copilot').click()
  await expect(page.getByText('Live transcript')).toBeVisible()

  await page.getByLabel('Close copilot').click()
  await expect(page.getByText('Live Copilot')).toHaveCount(0)

  await page.screenshot({ path: '.tmp-playwright/us-034-copilot-overlay.png', fullPage: true })
})
