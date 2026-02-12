import { test as base, expect } from '@playwright/test';
import type { PlayWrightAiFixtureType } from '@midscene/web/playwright';
import { PlaywrightAiFixture } from '@midscene/web/playwright';

const test = base.extend<PlayWrightAiFixtureType>(PlaywrightAiFixture({
  modelConfig: {
    MIDSCENE_MODEL_BASE_URL: process.env.MIDSCENE_MODEL_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta/openai/',
    MIDSCENE_MODEL_API_KEY: process.env.MIDSCENE_MODEL_API_KEY || '',
    MIDSCENE_MODEL_NAME: process.env.MIDSCENE_MODEL_NAME || 'gemini-2.0-flash',
    MIDSCENE_MODEL_FAMILY: process.env.MIDSCENE_MODEL_FAMILY || 'gemini',
  },
}));

const aiDelay = () => new Promise(resolve => setTimeout(resolve, 2000));

test.describe('EDUIO AI Tests - Login Flow', () => {

  test('AI: verify login page has all expected elements', async ({ page, ai, aiAssert }) => {
    await page.goto('/login', { waitUntil: 'networkidle' });
    await aiAssert('there is an email or mobile input field on the page');
    await aiDelay();
    await aiAssert('there is a password input field on the page');
    await aiDelay();
    await aiAssert('there is a login or sign in button on the page');
  });

  test('AI: complete login flow with valid credentials', async ({ page, ai, aiAssert }) => {
    await page.goto('/login', { waitUntil: 'networkidle' });
    await ai('type "7277114935" in the email or mobile input field');
    await aiDelay();
    await ai('type "7s6NSeTH" in the password field');
    await aiDelay();
    await ai('click the Login button');
    await page.waitForTimeout(8000);
    await aiAssert('the page shows a dashboard, sidebar menu, or has navigated away from the login page');
  });

  test('AI: verify error message on wrong credentials', async ({ page, ai, aiAssert }) => {
    await page.goto('/login', { waitUntil: 'networkidle' });
    await ai('type "0000000000" in the email or mobile input field');
    await aiDelay();
    await ai('type "wrongpassword" in the password field');
    await aiDelay();
    await ai('click the Login button');
    await page.waitForTimeout(3000);
    await aiAssert('the page shows an error message or the login form is still visible');
  });
});

test.describe('EDUIO AI Tests - Visual Checks', () => {

  test('AI: login page looks professional and styled', async ({ page, ai, aiAssert }) => {
    await page.goto('/login', { waitUntil: 'networkidle' });
    await aiAssert('the page has a clean design with a login form');
    await aiDelay();
    await aiAssert('the login form has input fields and a button');
  });

  test('AI: extract all visible text from login page', async ({ page, ai, aiQuery }) => {
    await page.goto('/login', { waitUntil: 'networkidle' });
    const pageData = await aiQuery(
      'extract: { title: "page heading text", hasLogo: "true/false", buttonText: "text on the main button", inputCount: "number of input fields" }'
    );
    console.log('AI extracted page data:', JSON.stringify(pageData, null, 2));
  });
});

test.describe('EDUIO AI Tests - Navigation', () => {

  test('AI: navigate through main menu items', async ({ page, ai, aiAssert }) => {
    await page.goto('/login', { waitUntil: 'networkidle' });
    await ai('type "7277114935" in the email or mobile input field');
    await aiDelay();
    await ai('type "7s6NSeTH" in the password field');
    await aiDelay();
    await ai('click the Login button');
    await page.waitForTimeout(8000);
    await ai('click on the first menu item in the sidebar or navigation');
    await page.waitForTimeout(3000);
    await aiAssert('a new page or section has loaded');
  });
});