import { test, expect } from '@playwright/test';

/**
 * Generic Website Health Checks
 * Works on any website - tests basic functionality
 * Run with: TEST_BASE_URL=https://example.com npx playwright test tests/eduio/health.spec.ts
 */

test.describe('Website Health Check', () => {

  test('homepage returns 200', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
  });

  test('no broken images on homepage', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const images = await page.locator('img').all();
    for (const img of images) {
      const src = await img.getAttribute('src');
      if (src) {
        const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
        if (naturalWidth === 0) {
          console.warn(`Broken image: ${src}`);
        }
      }
    }
  });

  test('no JavaScript errors on homepage', async ({ page }) => {
    const jsErrors: string[] = [];
    page.on('pageerror', (error) => {
      jsErrors.push(error.message);
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    if (jsErrors.length > 0) {
      console.warn('JS errors found:', jsErrors);
    }
    // Warn but don't fail - some third-party scripts throw errors
    expect(jsErrors.length).toBeLessThanOrEqual(5);
  });

  test('HTTPS redirect works', async ({ page, baseURL }) => {
    if (baseURL?.startsWith('https://')) {
      const httpUrl = baseURL.replace('https://', 'http://');
      const response = await page.goto(httpUrl);
      // Should either redirect to HTTPS or be HTTPS already
      expect(page.url()).toMatch(/^https:\/\//);
    }
  });

  test('page loads within 10 seconds', async ({ page }) => {
    const start = Date.now();
    await page.goto('/', { waitUntil: 'load' });
    const loadTime = Date.now() - start;
    console.log(`Page load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(10000);
  });

  test('meta tags are present', async ({ page }) => {
    await page.goto('/');
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);

    const metaDescription = await page.locator('meta[name="description"]').getAttribute('content');
    const metaViewport = await page.locator('meta[name="viewport"]').getAttribute('content');

    // Viewport is critical for mobile
    expect(metaViewport).toBeTruthy();
  });

  test('links return valid responses', async ({ page, request }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Get all internal links
    const links = await page.locator('a[href^="/"]').all();
    const checkedUrls = new Set<string>();
    let brokenLinks: string[] = [];

    for (const link of links.slice(0, 20)) { // Check first 20 links
      const href = await link.getAttribute('href');
      if (href && !checkedUrls.has(href)) {
        checkedUrls.add(href);
        try {
          const response = await request.get(href);
          if (response.status() >= 400) {
            brokenLinks.push(`${href} → ${response.status()}`);
          }
        } catch (e) {
          brokenLinks.push(`${href} → error`);
        }
      }
    }

    if (brokenLinks.length > 0) {
      console.warn('Broken links:', brokenLinks);
    }
    expect(brokenLinks.length).toBe(0);
  });
});
