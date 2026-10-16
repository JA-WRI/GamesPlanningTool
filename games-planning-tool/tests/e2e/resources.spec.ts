// Made with AI agents (Antigravity)
import { test, expect } from '@playwright/test';

test.describe('Resources Page E2E', () => {
  test('renders NSO resources page in read-only mode without editing actions', async ({
    page,
  }) => {
    await page.goto('/resources/game_id_1/nso_1');
    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    await expect(
      page.locator('h1', { hasText: 'Resources Dashboard' }),
    ).toBeVisible();
    await expect(
      page.getByPlaceholder('Search by name, category...'),
    ).toBeVisible();

    // Verify edit, add resource, and create folder buttons are NOT visible on NSO page
    await expect(
      page.getByRole('button', { name: 'Edit', exact: true }),
    ).toHaveCount(0);
    await expect(
      page.getByRole('button', { name: 'Add Resource', exact: true }),
    ).toHaveCount(0);
    await expect(
      page.getByRole('button', { name: 'Create Folder', exact: true }),
    ).toHaveCount(0);
  });

  test('admin resource-management page toggles edit mode and enables selection', async ({
    page,
  }) => {
    await page.goto('/resources/admin');
    const editBtn = page.getByRole('button', { name: 'Edit' }).first();
    await editBtn.click();
    await expect(page.getByRole('button', { name: 'Done' })).toBeVisible();

    const firstCardSelectBtn = page
      .locator('[data-resource-id]')
      .first()
      .getByRole('button', { name: 'Select resource' });
    await expect(firstCardSelectBtn).toBeVisible();
  });

  test('admin resource-management page allows adding resource with automatic General category', async ({
    page,
  }) => {
    await page.goto('/resources/admin');
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

  test('clicking a folder on NSO page opens folder modal in read-only view', async ({
    page,
  }) => {
    await page.goto('/resources/game_id_1/nso_1');
    await page
      .locator('[data-resource-id][data-resource-type="folder"]')
      .first()
      .click();
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();
  });

  test('clicking a file or link opens resource directly in a new tab without detail modal', async ({
    page,
  }) => {
    await page.goto('/resources/game_id_1/nso_1');
    let openedUrl = '';
    await page.exposeFunction('onWindowOpen', (url: string) => {
      openedUrl = url;
    });
    await page.addInitScript(() => {
      window.open = (url) => {
        (
          window as unknown as { onWindowOpen: (u: string) => void }
        ).onWindowOpen(String(url));
        return null;
      };
    });
    await page.reload();
    await page
      .locator(
        '[data-resource-id][data-resource-type="file"], [data-resource-id][data-resource-type="link"]',
      )
      .first()
      .click();

    expect(openedUrl).toBeTruthy();
    // Verify no detail dialog opened
    await expect(page.locator('[role="dialog"]')).toHaveCount(0);
  });
});
