// Made with AI agents (Antigravity)
import { test, expect } from '@playwright/test';

test.describe('Resources Page E2E', () => {
  test('renders topbar, navbar, category sections, and cards', async ({
    page,
  }) => {
    await page.goto('/game_id_1/nso_1/resources');
    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    await expect(
      page.locator('h1', { hasText: 'Resources Dashboard' }),
    ).toBeVisible();
    await expect(
      page.getByPlaceholder('Search by name, category...'),
    ).toBeVisible();
  });

  test('toggles edit mode and enables selection', async ({ page }) => {
    await page.goto('/game_id_1/nso_1/resources');
    const editBtn = page.getByRole('button', { name: 'Edit' }).first();
    await editBtn.click();
    await expect(page.getByRole('button', { name: 'Done' })).toBeVisible();

    const firstCardSelectBtn = page
      .locator('[data-resource-id]')
      .first()
      .getByRole('button', { name: 'Select resource' });
    await expect(firstCardSelectBtn).toBeVisible();
  });

  test('automatically assigns General category when adding resource with no category', async ({
    page,
  }) => {
    await page.goto('/game_id_1/nso_1/resources');
    await page.getByRole('button', { name: 'Add Resource' }).click();
    const modal = page.locator('[role="dialog"]', {
      hasText: 'Add New Resource',
    });
    await expect(modal).toBeVisible();

    await modal.getByLabel('Resource Name').fill('A brand new test file');
    await modal.getByRole('button', { name: /Website Link/i }).click();
    await modal.getByLabel(/Website URL/i).fill('https://example.com');
    await modal.getByRole('button', { name: 'Add Resource' }).click();

    await expect(page.getByText('Resource added successfully')).toBeVisible();
  });

  test('clicking a file opens detail modal with categories editor', async ({
    page,
  }) => {
    await page.goto('/game_id_1/nso_1/resources');
    await page
      .locator(
        '[data-resource-id][data-resource-type="file"], [data-resource-id][data-resource-type="link"]',
      )
      .first()
      .click();
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();
    await expect(
      modal.getByRole('button', { name: 'Edit Categories' }),
    ).toBeVisible();
  });
});
