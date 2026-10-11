// Made with AI agents (Antigravity)
import { test } from '@playwright/test';

test('take screenshot of dashboard', async ({ page }) => {
  await page.goto('http://localhost:3000/game_id_1/nso_1/dashboard');
  await page.waitForTimeout(2000);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'dashboard-debug.png' });
});
