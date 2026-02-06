# AI-Powered Web Testing Stack - Deployment Guide

## What You're Getting

| Component | Purpose | RAM Usage |
|-----------|---------|-----------|
| **Allure Dashboard** | Web UI to view test results, history, trends | ~400 MB |
| **Allure UI** | Prettier interface for the dashboard | ~150 MB |
| **Test Runner** | Playwright + Midscene.js AI + Chromium browser | ~1.5 GB peak |
| **Total** | | **~2 GB** |

Your VPS: 8 GB RAM, ~5 GB free → **plenty of headroom**

---

## Step 1: Create Git Repository

Push this entire folder to a Git repo (GitHub, GitLab, etc.):

```bash
cd testing-stack
git init
git add .
git commit -m "Initial: AI testing stack"
git remote add origin https://github.com/YOUR-USER/testing-stack.git
git push -u origin main
```

---

## Step 2: Deploy on Coolify

### 2A: Deploy Allure Dashboard (the report viewer)

1. Go to your **Coolify panel** → **Projects** → **New Resource**
2. Select **Docker Compose**
3. Connect your Git repo containing this code
4. In the **docker-compose.yml** deployment settings:
   - Set **Domain** for `allure` service: `https://allure.yourdomain.com`
   - Set **Port**: `5050`
   - Set **Domain** for `allure-ui` service: `https://allure-ui.yourdomain.com`
   - Set **Port**: `5252`
5. In **Environment Variables**, add:
   ```
   ALLURE_API_URL=https://allure.yourdomain.com
   TEST_BASE_URL=https://your-eduio-app.com
   MIDSCENE_MODEL_API_KEY=your-api-key
   MIDSCENE_MODEL_NAME=qwen/qwen-2.5-vl-72b-instruct
   MIDSCENE_MODEL_BASE_URL=https://openrouter.ai/api/v1
   CRON_SCHEDULE=0 */6 * * *
   ```
6. Click **Deploy**

### 2B: DNS Setup

Add these A records in your DNS manager (Hostinger DNS Manager):

| Type | Name | Value |
|------|------|-------|
| A | allure | 72.61.251.137 |
| A | allure-ui | 72.61.251.137 |

Coolify + Traefik will auto-generate SSL certificates via Let's Encrypt.

---

## Step 3: Get an AI API Key (for Midscene.js)

The AI tests need access to a vision-language model. Choose one:

### Option A: OpenRouter (Recommended - cheapest)
1. Go to [openrouter.ai](https://openrouter.ai)
2. Create account → Get API key
3. Add $5 credit (will last hundreds of test runs)
4. Use model: `qwen/qwen-2.5-vl-72b-instruct` (~$0.001 per test action)

### Option B: OpenAI
1. Go to [platform.openai.com](https://platform.openai.com)
2. Get API key
3. Use model: `gpt-4o` (~$0.005 per test action)

### Option C: Skip AI Tests
If you don't want AI tests yet, just set `MIDSCENE_MODEL_API_KEY=disabled`. The traditional Playwright tests will still work perfectly without any API key.

---

## Step 4: Run Tests

### Manual Run (trigger from anywhere)
```bash
# SSH into your VPS or use Coolify terminal
curl -X POST http://test-runner:3000/run
```

### Automatic (already configured)
Tests run automatically based on `CRON_SCHEDULE` (default: every 6 hours).

### View Results
Open your Allure dashboard:
- **Allure Dashboard**: `https://allure.yourdomain.com/allure-docker-service/projects/default/reports/latest/index.html`
- **Allure UI**: `https://allure-ui.yourdomain.com`

---

## Step 5: Customize Tests

### Update EDUIO Login Tests
Edit `tests/eduio/login.spec.ts`:
- Update the URL path if your login page is different from `/vendor-panel/login`
- Update the CSS selectors if needed (check your page's HTML)

### Update AI Tests
Edit `tests/ai-tests/eduio-ai.spec.ts`:
- Update email/password credentials for test account
- Add more test scenarios in plain English

### Add New Tests
Create new `.spec.ts` files in `tests/` directory. Examples:

```typescript
// tests/eduio/dashboard.spec.ts
import { test, expect } from '@playwright/test';

test('dashboard loads after login', async ({ page }) => {
  // your test here
});
```

---

## File Structure

```
testing-stack/
├── docker-compose.yml          # Coolify deployment config
├── Dockerfile.test-runner      # Test runner container
├── package.json                # Node.js dependencies
├── playwright.config.ts        # Playwright + Allure config
├── tsconfig.json               # TypeScript config
├── .env.example                # Environment template
├── .gitignore
├── entrypoint.sh               # Container startup script
├── scripts/
│   ├── upload-results.sh       # Push results to Allure
│   └── run-tests.sh            # Test execution wrapper
└── tests/
    ├── eduio/
    │   ├── login.spec.ts       # Login page tests (traditional)
    │   └── health.spec.ts      # General health checks
    └── ai-tests/
        └── eduio-ai.spec.ts    # AI-powered visual tests
```

---

## Resource Usage Summary

| Service | Idle RAM | Peak RAM | CPU |
|---------|----------|----------|-----|
| Allure Dashboard | 300 MB | 400 MB | 0.1 |
| Allure UI | 100 MB | 150 MB | 0.05 |
| Test Runner (idle) | 100 MB | 1.5 GB | 0.1 (peak: 1.0) |
| **Total** | **500 MB** | **2 GB** | **0.25 (peak: 1.15)** |

Your VPS has ~5 GB free RAM → this stack uses ~500 MB when idle, ~2 GB during test runs.

---

## Troubleshooting

### Tests fail with "browser not found"
The Dockerfile installs Chromium. If the Playwright version changes, update the Dockerfile base image version to match.

### AI tests timeout
Increase timeout in `playwright.config.ts` → `timeout: 180 * 1000` (3 minutes). AI actions can be slow.

### Allure dashboard empty
Check that test results are being uploaded: `curl http://test-runner:3000/logs`

### Out of memory
Run `docker stats` to check. If needed, reduce workers in playwright config or set `CRON_SCHEDULE=disabled` to only run manually.
