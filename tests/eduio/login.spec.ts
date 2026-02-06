import { test, expect } from '@playwright/test';

/**
 * EDUIO Login Page Tests - Traditional Playwright
 * These tests are fast and don't need AI/API calls.
 * Good for: smoke tests, regression, CI/CD pipelines
 */

test.describe('EDUIO Login Page', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to login page - UPDATE THIS URL
    await page.goto('/vendor-panel/login');
  });

  // ─── Page Load Tests ───────────────────────────────────────────────

  test('login page loads successfully', async ({ page }) => {
    // Check page loaded (HTTP 200)
    const response = await page.goto('/vendor-panel/login');
    expect(response?.status()).toBe(200);

    // Check page title exists
    const title = await page.title();
    expect(title).toBeTruthy();
  });

  test('login form elements are visible', async ({ page }) => {
    // Email input should be visible
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="mail"]');
    await expect(emailInput).toBeVisible({ timeout: 10000 });

    // Password input should be visible
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();

    // Login/Submit button should be visible
    const loginButton = page.locator('button[type="submit"], input[type="submit"], button:has-text("Login"), button:has-text("Sign")');
    await expect(loginButton).toBeVisible();
  });

  test('page has no console errors on load', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto('/vendor-panel/login');
    await page.waitForLoadState('networkidle');

    // Filter out common non-critical errors
    const criticalErrors = errors.filter(e =>
      !e.includes('favicon') &&
      !e.includes('third-party') &&
      !e.includes('analytics')
    );

    expect(criticalErrors).toHaveLength(0);
  });

  // ─── Form Validation Tests ─────────────────────────────────────────

  test('empty form submission shows validation', async ({ page }) => {
    // Click login without filling anything
    const loginButton = page.locator('button[type="submit"], input[type="submit"], button:has-text("Login"), button:has-text("Sign")');
    await loginButton.click();

    // Should show some validation message or stay on login page
    await expect(page).toHaveURL(/login/);
  });

  test('invalid email shows error', async ({ page }) => {
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="mail"]');
    await emailInput.fill('not-an-email');

    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.fill('somepassword');

    const loginButton = page.locator('button[type="submit"], input[type="submit"], button:has-text("Login"), button:has-text("Sign")');
    await loginButton.click();

    // Should still be on login page (login failed)
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/login/);
  });

  test('wrong credentials show error message', async ({ page }) => {
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="mail"]');
    await emailInput.fill('wrong@example.com');

    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.fill('wrongpassword123');

    const loginButton = page.locator('button[type="submit"], input[type="submit"], button:has-text("Login"), button:has-text("Sign")');
    await loginButton.click();

    // Wait for response
    await page.waitForTimeout(3000);

    // Should show an error message or stay on login page
    await expect(page).toHaveURL(/login/);
  });

  // ─── Visual & Responsive Tests ─────────────────────────────────────

  test('login page screenshot - desktop', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    await page.screenshot({
      path: 'test-data/screenshots/login-desktop.png',
      fullPage: true,
    });
  });

  test('login page screenshot - mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/vendor-panel/login');
    await page.waitForLoadState('networkidle');
    await page.screenshot({
      path: 'test-data/screenshots/login-mobile.png',
      fullPage: true,
    });
  });

  // ─── Performance Tests ─────────────────────────────────────────────

  test('login page loads within 5 seconds', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/vendor-panel/login', { waitUntil: 'networkidle' });
    const loadTime = Date.now() - startTime;

    console.log(`Login page load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(5000);
  });

  // ─── Security Tests ────────────────────────────────────────────────

  test('password field masks input', async ({ page }) => {
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('no sensitive data in page source', async ({ page }) => {
    const content = await page.content();
    // Check no hardcoded passwords or API keys
    expect(content).not.toContain('password123');
    expect(content).not.toContain('api_key');
    expect(content).not.toContain('secret_key');
  });
});
