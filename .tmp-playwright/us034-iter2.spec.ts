import { test, expect } from 'playwright/test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

test('US-034 overlay behavior on demo page with mocked stream', async ({ page }) => {
  await page.addInitScript(() => {
    class MockWebSocket {
      static CONNECTING = 0
      static OPEN = 1
      static CLOSING = 2
      static CLOSED = 3
      url: string
      readyState = MockWebSocket.CONNECTING
      onopen?: (event: Event) => void
      onmessage?: (event: MessageEvent) => void
      onclose?: (event: CloseEvent) => void

      constructor(url: string) {
        this.url = url
        setTimeout(() => {
          this.readyState = MockWebSocket.OPEN
          this.onopen?.(new Event('open'))

          const emit = (payload: unknown, delayMs: number) => {
            setTimeout(() => {
              this.onmessage?.({ data: JSON.stringify(payload) } as MessageEvent)
            }, delayMs)
          }

          emit({
            type: 'kpi',
            sessionId: 'session_123',
            kpis: {
              sessionId: 'session_123',
              talkRatio: 55,
              fillerCount: 2,
              fillerRatePerMinute: 1.8,
              paceWordsPerMinute: 145,
              questionsAsked: 3,
              turnCount: 8,
              userWordCount: 190,
              customerWordCount: 155,
              durationMs: 65_000,
              noQuestionWindowMs: 0,
              deadAirMs: 400,
              hasSpeech: true,
              timestampMs: Date.now(),
            },
          }, 100)

          emit({
            type: 'coaching',
            sessionId: 'session_123',
            suggestion: {
              id: 'suggestion_1',
              type: 'objection',
              message: 'Objection detected: ask one clarifying question before rebuttal.',
              severity: 'warning',
              timestampMs: Date.now(),
            },
          }, 200)

          emit({
            type: 'transcript',
            transcriptType: 'final',
            transcript: {
              sessionId: 'session_123',
              text: 'Can you justify the implementation timeline?',
              speaker: 'customer',
              speakerIndex: 1,
              user: false,
              isFinal: true,
              startMs: 20_000,
              endMs: 24_000,
              confidence: 0.92,
            },
          }, 300)

          emit({
            type: 'transcript',
            transcriptType: 'final',
            transcript: {
              sessionId: 'session_123',
              text: 'Absolutely, here is the rollout plan and milestones.',
              speaker: 'user',
              speakerIndex: 0,
              user: true,
              isFinal: true,
              startMs: 25_000,
              endMs: 30_000,
              confidence: 0.95,
            },
          }, 400)

          setTimeout(() => this.close(1006, 'mock disconnect'), 650)
        }, 50)
      }

      send() {}

      close(code = 1000, reason = '') {
        this.readyState = MockWebSocket.CLOSED
        this.onclose?.({ code, reason, wasClean: code === 1000 } as CloseEvent)
      }
    }

    // @ts-expect-error test harness override
    window.WebSocket = MockWebSocket
  })

  await page.goto('http://127.0.0.1:3100/demo-credentials?copilotPreview=1', { waitUntil: 'networkidle' })

  const overlay = page.locator('div.fixed.right-4.bottom-4').first()
  await expect(overlay.getByText('Live Copilot')).toBeVisible()
  await expect(overlay.getByText('55%')).toBeVisible()
  await expect(overlay.getByText('145 wpm')).toBeVisible()
  await expect(overlay.getByText('1:05')).toBeVisible()
  await expect(overlay.getByText('Customer', { exact: true }).first()).toBeVisible()
  await expect(overlay.getByText('You', { exact: true }).first()).toBeVisible()

  const before = await overlay.boundingBox()
  const dragHandle = page.getByRole('button', { name: /live copilot/i })
  const handleBox = await dragHandle.boundingBox()

  expect(before).not.toBeNull()
  expect(handleBox).not.toBeNull()

  await page.mouse.move(handleBox!.x + handleBox!.width / 2, handleBox!.y + handleBox!.height / 2)
  await page.mouse.down()
  await page.mouse.move(handleBox!.x - 170, handleBox!.y - 90, { steps: 15 })
  await page.mouse.up()

  await page.waitForTimeout(250)
  const after = await overlay.boundingBox()
  expect(after).not.toBeNull()

  const moved = Math.abs(after!.x - before!.x) > 20 || Math.abs(after!.y - before!.y) > 20
  expect(moved).toBeTruthy()

  await page.getByRole('button', { name: 'Minimize copilot' }).click()
  await expect(overlay.getByText('Reconnecting...').first()).toBeVisible()

  await page.getByRole('button', { name: 'Expand copilot' }).click()

  await page.waitForTimeout(10_500)
  await expect(
    page.getByText('Objection detected: ask one clarifying question before rebuttal.'),
  ).toHaveCount(0)

  const artifactDir = path.join(os.tmpdir(), 'playwright-artifacts')
  fs.mkdirSync(artifactDir, { recursive: true })

  const screenshotPath = path.join(artifactDir, 'us-034-iter2-browser.png')
  await page.screenshot({ path: screenshotPath, fullPage: true })

  await page.getByRole('button', { name: 'Close copilot' }).click()
  await expect(page.getByText('Live Copilot')).toHaveCount(0)

  fs.writeFileSync(
    path.join(artifactDir, 'us-034-iter2-browser.json'),
    JSON.stringify({ moved, screenshot: screenshotPath }, null, 2),
  )
})
