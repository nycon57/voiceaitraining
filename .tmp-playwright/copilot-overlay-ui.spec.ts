import { expect, test } from 'playwright/test'

const BASE_URL = 'http://localhost:3007'

test('copilot overlay is visible and can minimize/close on live call page', async ({ page, context }) => {
  await context.grantPermissions(['microphone'], { origin: BASE_URL })

  await page.goto(`${BASE_URL}/sign-in`, { waitUntil: 'networkidle' })

  // Clerk can render different sign-in steps; fill whichever inputs are visible.
  const emailInput = page.locator('input[name="identifier"], input[type="email"]').first()
  await expect(emailInput).toBeVisible({ timeout: 20000 })
  await emailInput.fill('manager@demo.com')

  const continueButton = page
    .getByRole('button', { name: /continue|sign in/i })
    .first()
  await continueButton.click()

  const passwordInput = page.locator('input[name="password"], input[type="password"]').first()
  await expect(passwordInput).toBeVisible({ timeout: 20000 })
  await passwordInput.fill('Demo123!')

  const submitButton = page
    .getByRole('button', { name: /continue|sign in/i })
    .last()
  await submitButton.click()

  await page.waitForURL(/\/dashboard/, { timeout: 30000 })

  await page.goto(`${BASE_URL}/scenarios`, { waitUntil: 'networkidle' })

  const firstCallLink = page.locator('a[href*="/play/"][href$="/call"]').first()
  await expect(firstCallLink).toBeVisible({ timeout: 20000 })
  const callUrl = await firstCallLink.getAttribute('href')
  expect(callUrl).toBeTruthy()

  await page.goto(`${BASE_URL}${callUrl}`, { waitUntil: 'networkidle' })

  await expect(page.getByText('Live Copilot')).toBeVisible({ timeout: 20000 })

  const minimizeButton = page.getByRole('button', { name: /minimize copilot/i })
  await minimizeButton.click()
  await expect(page.getByRole('button', { name: /expand copilot/i })).toBeVisible()

  await page.getByRole('button', { name: /close copilot/i }).click()
  await expect(page.getByText('Live Copilot')).toHaveCount(0)
})
