import { test, expect } from 'playwright/test'

const BASE_URL = 'http://localhost:3000'

test('US-040 ROI browser verification fallback', async ({ page }) => {
  await page.goto(`${BASE_URL}/analytics/roi`, { waitUntil: 'domcontentloaded' })
  await expect(page).toHaveURL(/\/sign-in|clerk/)
  await page.screenshot({ path: 'us040-roi-unauth-20260218-040748-52679.png', fullPage: true })

  const identifier = page.locator('input[name="identifier"], input[type="email"]').first()
  const password = page.locator('input[name="password"], input[type="password"]').first()
  if (await identifier.count()) {
    await identifier.fill('manager@demo.com')
  }
  if (await password.count()) {
    await password.fill('Demo123!')
  }

  const submit = page
    .locator('button[type="submit"], button:has-text("Continue"), button:has-text("Sign in"), button:has-text("Continue to sign in")')
    .first()

  if (await submit.count()) {
    await submit.click()
    await page.waitForTimeout(2500)
  }

  await page.screenshot({ path: 'us040-roi-manager-login-attempt-20260218-040748-52679.png', fullPage: true })

  if (page.url().includes('/sign-in/factor-one')) {
    const retryPassword = page.locator('input[name="password"], input[type="password"]').first()
    const retrySubmit = page
      .locator('button[type="submit"], button:has-text("Continue"), button:has-text("Sign in"), button:has-text("Continue to sign in")')
      .first()

    if (await retryPassword.count()) {
      await retryPassword.fill('Demo123!')
    }
    if (await retrySubmit.count()) {
      await retrySubmit.click()
      await page.waitForTimeout(2500)
    }

    await page.screenshot({ path: 'us040-roi-manager-factor-one-retry-20260218-040748-52679.png', fullPage: true })
  }

  console.log(`US-040 final URL: ${page.url()}`)
})
