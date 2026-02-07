import { test as base, expect } from '@playwright/test';
import type { PlayWrightAiFixtureType } from '@midscene/web/playwright';
import { PlaywrightAiFixture } from '@midscene/web/playwright';

/**
 * EDUIO AI-Powered Tests - Midscene.js
 * These tests use natural language + AI vision to interact with the page.
 */

const test = base.extend<PlayWrightAiFixtureType>(PlaywrightAiFixture());

test.describe('EDUIO AI Tests - Login Flow', () => {

  test('AI: verify login page has all expected elements', async ({ page, ai, aiAssert }) => {
    await page.goto('/vendor-panel/login');
    await page.waitForLoadState('networkidle');

    await aiAssert('there is an email or username input field on the page');
    await aiAssert('there is a password input field on the page');
    await aiAssert('there is a login or sign in button on the page');
  });

  test('AI: complete login flow with valid credentials', async ({ page, ai, aiAssert }) => {
    await page.goto('/vendor-panel/login');
    await page.waitForLoadState('networkidle');

    await ai('type "admin@eduio.com" in the email input field');
    await ai('type "your-test-password" in the password field');
    await ai('click the Login button');

    await page.waitForTimeout(5000);

    await aiAssert('the page shows a dashboard or welcome message');
  });

  test('AI: verify error message on wrong credentials', async ({ page, ai, aiAssert }) => {
    await page.goto('/vendor-panel/login');
    await page.waitForLoadState('networkidle');

    await ai('type "wrong@email.com" in the email field');
    await ai('type "wrongpassword" in the password field');
    await ai('click the Login button');

    await page.waitForTimeout(3000);

    await aiAssert('the page shows an error message or the login form is still visible');
  });
});

test.describe('EDUIO AI Tests - Visual Checks', () => {

  test('AI: login page looks professional and styled', async ({ page, ai, aiAssert }) => {
    await page.goto('/vendor-panel/login');
    await page.waitForLoadState('networkidle');

    await aiAssert('the page has a dark theme or professional design');
    await aiAssert('the login form is centered on the page');
  });

  test('AI: extract all visible text from login page', async ({ page, ai, aiQuery }) => {
    await page.goto('/vendor-panel/login');
    await page.waitForLoadState('networkidle');

    const pageData = await aiQuery(
      'extract: { title: "page heading text", hasLogo: "true/false", buttonText: "text on the main button", inputCount: "number of input fields" }'
    );

    console.log('AI extracted page data:', JSON.stringify(pageData, null, 2));
  });
});

test.describe('EDUIO AI Tests - Navigation', () => {

  test('AI: navigate through main menu items', async ({ page, ai, aiAssert }) => {
    await page.goto('/vendor-panel/login');
    await page.waitForLoadState('networkidle');

    await ai('type "admin@eduio.com" in the email field');
    await ai('type "your-test-password" in the password field');
    await ai('click the Login button');
    await page.waitForTimeout(5000);

    await ai('click on the first menu item in the sidebar or navigation');
    await page.waitForTimeout(2000);

    await aiAssert('a new page or section has loaded');
  });
});
