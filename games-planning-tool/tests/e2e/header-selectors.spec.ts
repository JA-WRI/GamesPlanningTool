// 100% AI generated: E2E tests for the header game/NSO selectors and the DB-backed route checks
import crypto from 'crypto';
import { test, expect, type Page } from '@playwright/test';
import {
  createTestGameWithNso,
  deleteTestGameWithNso,
  withClient,
  type TestGameWithNso,
} from './helpers/test-data';

// The navbar stays invisible until it has measured itself after hydration,
// so once it's visible the selectors' onChange handlers are attached.
async function waitForApp(page: Page) {
  await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
}

const optionFor = (select: ReturnType<Page['getByLabel']>, id: string) =>
  select.locator(`option[value="${id}"]`);

test.describe('Header selectors', () => {
  let main: TestGameWithNso; // active game with two active NSOs + one inactive NSO
  let other: TestGameWithNso; // second active game with its own NSO
  let secondNsoId: string;
  let inactiveNsoId: string;
  let inactiveGameId: string;

  test.beforeAll(async () => {
    main = await createTestGameWithNso();
    other = await createTestGameWithNso();
    secondNsoId = crypto.randomUUID();
    inactiveNsoId = crypto.randomUUID();
    const suffix = crypto.randomUUID().slice(0, 8);

    // Page-specific data: extra NSOs on the main game, and an inactive game.
    inactiveGameId = await withClient(async (client) => {
      await client.query(
        `INSERT INTO nsos (id, name, sport, is_active) VALUES
           ($1, $2, 'Testing', true),
           ($3, $4, 'Testing', false)`,
        [
          secondNsoId,
          `E2E NSO ${suffix} second`,
          inactiveNsoId,
          `E2E NSO ${suffix} inactive`,
        ],
      );
      await client.query(
        `INSERT INTO game_nsos (id, game_id, nso_id) VALUES ($1, $2, $3), ($4, $2, $5)`,
        [
          crypto.randomUUID(),
          Number(main.gameId),
          secondNsoId,
          crypto.randomUUID(),
          inactiveNsoId,
        ],
      );
      const { rows } = await client.query<{ id: number }>(
        `INSERT INTO games (name, country, city, start_date, end_date, planning_period_start, planning_period_end, is_active)
         VALUES ($1, 'Canada', 'Test City', '2020-07-01', '2020-07-15', '2019-01-01', '2020-06-01', false)
         RETURNING id`,
        [`E2E Game ${suffix} inactive`],
      );
      return String(rows[0].id);
    });
  });

  test.afterAll(async () => {
    // Remove the extra links first so the shared helper can delete the games.
    await withClient(async (client) => {
      const extraNsos = [secondNsoId, inactiveNsoId].filter(Boolean);
      await client.query(
        `DELETE FROM game_nsos WHERE nso_id = ANY($1::uuid[])`,
        [extraNsos],
      );
      await client.query(`DELETE FROM nsos WHERE id = ANY($1::uuid[])`, [
        extraNsos,
      ]);
      if (inactiveGameId) {
        await client.query(`DELETE FROM games WHERE id = $1`, [
          Number(inactiveGameId),
        ]);
      }
    });
    if (main) await deleteTestGameWithNso(main);
    if (other) await deleteTestGameWithNso(other);
  });

  test('game dropdown lists active games, selects the current one, and hides inactive games', async ({
    page,
  }) => {
    await page.goto(`/${main.gameId}/dashboard`);
    await waitForApp(page);

    const gameSelect = page.getByLabel('Select game');
    await expect(gameSelect).toHaveValue(main.gameId);
    await expect(optionFor(gameSelect, main.gameId)).toHaveCount(1);
    await expect(optionFor(gameSelect, other.gameId)).toHaveCount(1);
    await expect(optionFor(gameSelect, inactiveGameId)).toHaveCount(0);
  });

  test("NSO dropdown only lists the current game's active NSOs", async ({
    page,
  }) => {
    await page.goto(`/${main.gameId}/dashboard`);
    await waitForApp(page);

    const nsoSelect = page.getByLabel('Select NSO');
    await expect(optionFor(nsoSelect, main.nsoId)).toHaveCount(1);
    await expect(optionFor(nsoSelect, secondNsoId)).toHaveCount(1);
    await expect(optionFor(nsoSelect, inactiveNsoId)).toHaveCount(0); // inactive
    await expect(optionFor(nsoSelect, other.nsoId)).toHaveCount(0); // other game
  });

  test('choosing a game navigates to that game’s dashboard', async ({
    page,
  }) => {
    await page.goto(`/${other.gameId}/dashboard`);
    await waitForApp(page);

    await page.getByLabel('Select game').selectOption(main.gameId);
    await expect(page).toHaveURL(new RegExp(`/${main.gameId}/dashboard$`));
  });

  test('choosing an NSO on an NSO page keeps the same section', async ({
    page,
  }) => {
    await page.goto(`/${main.gameId}/${main.nsoId}/resources`);
    await waitForApp(page);

    await page.getByLabel('Select Nso').selectOption(secondNsoId);
    await expect(page).toHaveURL(
      new RegExp(`/${main.gameId}/${secondNsoId}/resources$`),
    );
    await expect(
      page.locator('h1', { hasText: 'Resources Dashboard' }),
    ).toBeVisible();
  });

  test('unknown, inactive, or mismatched ids return 404', async ({ page }) => {
    const notFoundPaths = [
      `/${inactiveGameId}/dashboard`, // inactive game
      `/999999999/dashboard`, // game that doesn't exist
      `/game_id_1/dashboard`, // old mock id
      `/${main.gameId}/not-a-uuid/resources`, // malformed NSO id
      `/${main.gameId}/${other.nsoId}/resources`, // NSO from another game
      `/${main.gameId}/${inactiveNsoId}/resources`, // inactive NSO
    ];

    for (const path of notFoundPaths) {
      const response = await page.goto(path);
      expect(response?.status(), path).toBe(404);
    }
  });
});
