import { test, expect } from '@playwright/test';
import { PlaywrightAiFixture } from '@midscene/web/playwright';

/**
 * EDUIO AI-Powered Tests - Midscene.js
 * These tests use natural language + AI vision to interact with the page.
 * Good for: complex flows, visual verification, self-healing tests
 *
 * NOTE: These tests require MIDSCENE_MODEL_API_KEY to be set.
 * They are slower (5-15s per AI action) but more resilient to UI changes.
 */

// Extend Playwright with Midscene AI capabilities
const aiTest = test.extend<PlaywrightAiFixture>({
  // @ts-ignore - Midscene extends the test fixtures
  ...PlaywrightAiFixture,
});

aiTest.describe('EDUIO AI Tests - Login Flow', () => {

  aiTest('AI: verify login page has all expected elements', async ({ page, ai, aiAssert }) => {
    await page.goto('/vendor-panel/login');
    await page.waitForLoadState('networkidle');

    // AI looks at the screenshot and verifies visually
    await aiAssert('there is an email or username input field on the page');
    await aiAssert('there is a password input field on the page');
    await aiAssert('there is a login or sign in button on the page');
  });

  aiTest('AI: complete login flow with valid credentials', async ({ page, ai, aiAssert }) => {
    await page.goto('/vendor-panel/login');
    await page.waitForLoadState('networkidle');

    // AI types in the email field (finds it visually, not by CSS selector)
    await ai('type "admin@eduio.com" in the email input field');

    // AI types the password
    await ai('type "your-test-password" in the password field');

    // AI clicks the login button
    await ai('click the Login button');

    // Wait for navigation
    await page.waitForTimeout(5000);

    // AI verifies we reached the dashboard
    await aiAssert('the page shows a dashboard or welcome message');
  });

  aiTest('AI: verify error message on wrong credentials', async ({ page, ai, aiAssert }) => {
    await page.goto('/vendor-panel/login');
    await page.waitForLoadState('networkidle');

    await ai('type "wrong@email.com" in the email field');
    await ai('type "wrongpassword" in the password field');
    await ai('click the Login button');

    await page.waitForTimeout(3000);

    // AI checks for error feedback
    await aiAssert('the page shows an error message or the login form is still visible');
  });
});

aiTest.describe('EDUIO AI Tests - Visual Checks', () => {

  aiTest('AI: login page looks professional and styled', async ({ page, ai, aiAssert }) => {
    await page.goto('/vendor-panel/login');
    await page.waitForLoadState('networkidle');

    // AI evaluates the visual design
    await aiAssert('the page has a dark theme or professional design');
    await aiAssert('the login form is centered on the page');
  });

  aiTest('AI: extract all visible text from login page', async ({ page, ai, aiQuery }) => {
    await page.goto('/vendor-panel/login');
    await page.waitForLoadState('networkidle');

    // AI extracts structured data from the page
    const pageData = await aiQuery(
      'extract: { title: "page heading text", hasLogo: "true/false", buttonText: "text on the main button", inputCount: "number of input fields" }'
    );

    console.log('AI extracted page data:', JSON.stringify(pageData, null, 2));
  });
});

aiTest.describe('EDUIO AI Tests - Navigation', () => {

  aiTest('AI: navigate through main menu items', async ({ page, ai, aiAssert }) => {
    // First login (update credentials)
    await page.goto('/vendor-panel/login');
    await page.waitForLoadState('networkidle');

    await ai('type "admin@eduio.com" in the email field');
    await ai('type "your-test-password" in the password field');
    await ai('click the Login button');
    await page.waitForTimeout(5000);

    // Now test navigation - AI finds menu items visually
    // These will adapt even if menu structure changes
    await ai('click on the first menu item in the sidebar or navigation');
    await page.waitForTimeout(2000);

    await aiAssert('a new page or section has loaded');
  });
});
