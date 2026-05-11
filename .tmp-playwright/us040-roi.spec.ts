import { test, expect } from 'playwright/test'

const baseURL = 'http://localhost:3000'

test('unauthenticated users are redirected away from ROI dashboard', async ({ page }) => {
  await page.goto(`${baseURL}/analytics/roi`, { waitUntil: 'networkidle' })
  await expect(page).toHaveURL(/\/sign-in|\/sign-in\//)
  await page.screenshot({ path: 'us040-roi-unauth.png', fullPage: true })
})

test('manager can access ROI dashboard', async ({ page }) => {
  await page.goto(`${baseURL}/sign-in`, { waitUntil: 'domcontentloaded' })

  const emailInput = page.locator('input[name="identifier"], input[name="emailAddress"], input[type="email"]').first()
  await emailInput.waitFor({ state: 'visible', timeout: 15000 })
  await emailInput.fill('manager@demo.com')

  const continueButton = page.getByRole('button', { name: /continue|next|sign in/i }).first()
  await continueButton.click()

  const passwordInput = page.locator('input[name="password"], input[type="password"]').first()
  await passwordInput.waitFor({ state: 'visible', timeout: 15000 })
  await passwordInput.fill('Demo123!')

  const submitButton = page.getByRole('button', { name: /continue|sign in|log in/i }).first()
  await submitButton.click()

  await page.goto(`${baseURL}/analytics/roi`, { waitUntil: 'networkidle' })
  await expect(page.getByRole('heading', { name: /roi dashboard/i })).toBeVisible({ timeout: 15000 })

  await expect(page.getByText(/per-rep attribution/i)).toBeVisible()
  await page.screenshot({ path: 'us040-roi-auth.png', fullPage: true })
})
