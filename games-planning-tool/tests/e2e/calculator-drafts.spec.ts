// AI contribution: Above 50% AI-generated
import { expect, test } from '@playwright/test';
import { requireLocalDatabaseUrl } from './helpers/local-database';
import {
  createTestGameWithNso,
  deleteTestGameWithNso,
  withClient,
} from './helpers/test-data';

const calculatorId = 1;
const draftScope = 'admin:game_id_1:all:calculator:1:estimated-costs';
const category = 'Travel Economy Fare';

async function savedAmount() {
  return withClient(async (client) => {
    const { rows } = await client.query<{ amount: number }>(
      `SELECT amount FROM calculator_estimated_cost_items
       WHERE calculator_id = $1 AND category = $2`,
      [calculatorId, category],
    );
    return rows[0]?.amount ?? null;
  });
}

async function draftAmount() {
  return withClient(async (client) => {
    const { rows } = await client.query<{
      payload: { rows: { category: string; amount: number }[] };
    }>(`SELECT payload FROM drafts WHERE scope_key = $1`, [draftScope]);
    return (
      rows[0]?.payload.rows.find((row) => row.category === category)?.amount ??
      null
    );
  });
}

test('calculator costs save, restore, switch currency, and discard', async ({
  page,
}) => {
  test.setTimeout(60_000);

  // The calculator currently always uses ID 1, so it cannot be isolated by game.
  const database = new URL(requireLocalDatabaseUrl()).pathname.slice(1);
  if (!database.endsWith('_test')) {
    throw new Error(
      'Calculator E2E tests require a dedicated *_test database.',
    );
  }
  const existing = await withClient(async (client) => {
    const costs = await client.query(
      'SELECT 1 FROM calculator_estimated_cost_items WHERE calculator_id = $1 LIMIT 1',
      [calculatorId],
    );
    const draft = await client.query(
      'SELECT 1 FROM drafts WHERE scope_key = $1',
      [draftScope],
    );
    return { costs: costs.rowCount, draft: draft.rowCount };
  });
  expect(existing, 'Calculator 1 and its draft must be empty').toEqual({
    costs: 0,
    draft: 0,
  });

  const fixture = await createTestGameWithNso();
  try {
    await page.goto(`/${fixture.gameId}/${fixture.nsoId}/calculator`);

    const header = page
      .getByRole('heading', { name: 'ESTIMATED COSTS' })
      .locator('../..');
    const displayRow = () =>
      page.getByRole('row').filter({ hasText: category });
    const editRow = () =>
      page
        .locator('tr')
        .filter({ has: page.locator(`input[value="${category}"]`) });
    const currency = page.getByRole('group', {
      name: 'Select calculator currency',
    });

    await header.getByRole('button', { name: 'Edit', exact: true }).click();
    await editRow().getByPlaceholder('Amount').fill('138');
    await header.getByRole('button', { name: 'Save changes' }).click();
    await expect.poll(savedAmount).toBe(138);
    await expect.poll(draftAmount).toBeNull();

    await header.getByRole('button', { name: 'Edit', exact: true }).click();
    await editRow().getByPlaceholder('Amount').fill('276');
    await currency.getByRole('button', { name: 'USD' }).click();

    await expect(currency.getByRole('button', { name: 'USD' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(displayRow().locator('td').nth(1)).toHaveText('200');
    await expect.poll(draftAmount).toBe(276);
    expect(await savedAmount()).toBe(138);

    await page.reload();
    await expect(currency.getByRole('button', { name: 'CAD' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(header.getByRole('status')).toHaveText('Draft restored');
    await expect(displayRow().locator('td').nth(1)).toHaveText('276');

    page.once('dialog', (dialog) => dialog.dismiss());
    await header.getByRole('button', { name: 'Discard draft' }).click();
    await expect(displayRow().locator('td').nth(1)).toHaveText('276');
    expect(await draftAmount()).toBe(276);
    expect(await savedAmount()).toBe(138);

    page.once('dialog', (dialog) => dialog.accept());
    await header.getByRole('button', { name: 'Discard draft' }).click();
    await expect.poll(draftAmount).toBeNull();
    await expect(displayRow().locator('td').nth(1)).toHaveText('138');
    expect(await savedAmount()).toBe(138);

    await page.reload();
    await expect(displayRow().locator('td').nth(1)).toHaveText('138');
    await expect(
      header.getByRole('button', { name: 'Discard draft' }),
    ).toHaveCount(0);

    await currency.getByRole('button', { name: 'USD' }).click();
    await expect(displayRow().locator('td').nth(1)).toHaveText('100');
    await header.getByRole('button', { name: 'Edit', exact: true }).click();
    await editRow().getByPlaceholder('Amount').fill('200');
    await header.getByRole('button', { name: 'Save changes' }).click();
    await expect.poll(savedAmount).toBe(276);
    await expect.poll(draftAmount).toBeNull();

    await page.reload();
    await expect(displayRow().locator('td').nth(1)).toHaveText('276');
  } finally {
    await withClient(async (client) => {
      await client.query('DELETE FROM drafts WHERE scope_key = $1', [
        draftScope,
      ]);
      await client.query(
        'DELETE FROM calculator_estimated_cost_items WHERE calculator_id = $1',
        [calculatorId],
      );
    });
    await deleteTestGameWithNso(fixture);
  }
});
