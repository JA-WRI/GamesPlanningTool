import { test, expect, Page, Locator } from '@playwright/test';

async function setupWinterCards(page: Page, requiredCount = 2) {
  await page.goto('/resources');
  await page.getByRole('button', { name: 'Edit' }).first().click();
  const winterSection = page.locator(
    'section:has(h2:has-text("Winter Games"))',
  );
  const cards = winterSection.locator('[data-resource-id]');
  if (requiredCount > 0) {
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(requiredCount);
  }
  return { winterSection, cards };
}

async function selectFirstTwo(page: Page, cards: Locator) {
  const card0 = cards.nth(0);
  const card1 = cards.nth(1);
  const id0 = await card0.getAttribute('data-resource-id');
  const id1 = await card1.getAttribute('data-resource-id');
  await card0.click();
  await card1.click();
  await expect(
    page.getByRole('button', { name: 'Delete (2)' }).first(),
  ).toBeVisible();
  return { id0, id1 };
}

async function expectNoDeletes(page: Page) {
  await expect(
    page.getByRole('button', { name: /Delete \(\d+\)/ }),
  ).toHaveCount(0);
}

async function getBoxes(cards: Locator, count = 3) {
  const boxes = await Promise.all(
    Array.from({ length: count }, (_, i) => cards.nth(i).boundingBox()),
  );
  for (const b of boxes) {
    if (!b) throw new Error('Bounding boxes missing');
  }
  return boxes as NonNullable<(typeof boxes)[0]>[];
}

const mid = (box: { x: number; y: number; width: number; height: number }) => ({
  x: box.x + box.width / 2,
  y: box.y + box.height / 2,
});

async function dragOverWhitespace(page: Page, clientX = 400, clientY = 480) {
  await page.evaluate(
    ({ cx, cy }) => {
      const dt =
        (window as unknown as { __testDt?: DataTransfer }).__testDt ||
        new DataTransfer();
      document.querySelector('main')?.dispatchEvent(
        new DragEvent('dragover', {
          bubbles: true,
          cancelable: true,
          clientX: cx,
          clientY: cy,
          dataTransfer: dt,
        }),
      );
    },
    { cx: clientX, cy: clientY },
  );
}

async function dragOverSection(page: Page, sectionTitle: string) {
  await page.evaluate((title) => {
    const dt =
      (window as unknown as { __testDt?: DataTransfer }).__testDt ||
      new DataTransfer();
    const sections = Array.from(document.querySelectorAll('section'));
    const target = sections.find((s) =>
      s.querySelector('h2')?.textContent?.includes(title),
    );
    target?.dispatchEvent(
      new DragEvent('dragover', {
        bubbles: true,
        cancelable: true,
        dataTransfer: dt,
      }),
    );
  }, sectionTitle);
}

test.describe('Resources Page E2E', () => {
  test('renders topbar, navbar, category sections, and cards', async ({
    page,
  }) => {
    await page.goto('/resources');

    await expect(page.getByText('Games Planning Tool')).toBeVisible();
    await expect(page.getByText('Alex Dunphy')).toBeVisible();

    await expect(
      page.getByRole('heading', { name: 'Winter Games' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Summer Games' }),
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: 'General' })).toBeVisible();
  });

  test('toggles edit mode and enables selection', async ({ page }) => {
    await page.goto('/resources');

    const editBtn = page.getByRole('button', { name: 'Edit' }).first();
    await editBtn.click();

    await expect(
      page.getByRole('button', { name: 'Done' }).first(),
    ).toBeVisible();

    const card = page.locator('[data-resource-id]').first();
    await card.click();

    await expect(
      page.getByRole('button', { name: /Delete \(1\)/ }).first(),
    ).toBeVisible();
  });

  test('automatically assigns General category when adding resource with no category', async ({
    page,
  }) => {
    await page.goto('/resources');

    await page.getByRole('button', { name: 'Add' }).first().click();
    await expect(page.getByText('Add New Resource')).toBeVisible();

    await page.fill(
      'input[placeholder="e.g. LA 2028 Team Roster Guide"]',
      'E2E Test Handbook',
    );
    await page.fill(
      'input[placeholder="https://olympic.ca/handbook"]',
      'https://olympic.ca/e2e-handbook',
    );

    await page.getByRole('button', { name: 'Add Resource' }).click();

    const generalSection = page.locator('section:has(h2:has-text("General"))');
    await expect(generalSection.getByText('E2E Test Handbook')).toBeVisible();
  });

  test('supports directional sweep selection and reversing direction', async ({
    page,
  }) => {
    const { winterSection: catSection, cards } = await setupWinterCards(
      page,
      3,
    );
    const card1 = cards.nth(0);
    const roundBtn1 = card1.locator('button').first();
    const r1Box = await roundBtn1.boundingBox();
    const [, b2, b3] = await getBoxes(cards, 3);

    if (!r1Box) throw new Error('Round button box not found');

    await page.mouse.move(r1Box.x + 10, r1Box.y + 10);
    await page.mouse.down();
    await page.mouse.move(b3.x + b3.width - 20, b3.y + b3.height / 2, {
      steps: 8,
    });

    await expect(
      catSection.getByRole('button', { name: 'Delete (3)' }),
    ).toBeVisible();

    await page.mouse.move(b3.x + 20, b3.y + b3.height / 2, {
      steps: 5,
    });
    await expect(
      catSection.getByRole('button', { name: 'Delete (2)' }),
    ).toBeVisible();

    await page.mouse.move(b3.x + b3.width - 20, b3.y + b3.height / 2, {
      steps: 5,
    });
    await expect(
      catSection.getByRole('button', { name: 'Delete (3)' }),
    ).toBeVisible();

    await page.mouse.move(b2.x + b2.width / 2, b2.y + b2.height / 2, {
      steps: 8,
    });
    await expect(
      catSection.getByRole('button', { name: 'Delete (1)' }),
    ).toBeVisible();

    await page.mouse.move(b2.x + b2.width / 2 + 15, b2.y + b2.height / 2, {
      steps: 3,
    });
    await expect(
      catSection.getByRole('button', { name: 'Delete (2)' }),
    ).toBeVisible();

    await page.mouse.up();
  });

  test('supports dragging resource to another category and dragging out to remove', async ({
    page,
  }) => {
    await page.goto('/resources');

    await page.getByRole('button', { name: 'Edit' }).first().click();
    await expect(
      page.getByRole('button', { name: 'Done' }).first(),
    ).toBeVisible();

    await page.evaluate(async () => {
      const sections = Array.from(document.querySelectorAll('section'));
      const winterSection = sections.find((s) =>
        s.querySelector('h2')?.textContent?.includes('Winter Games'),
      );
      const summerSection = sections.find((s) =>
        s.querySelector('h2')?.textContent?.includes('Summer Games'),
      );
      const generalSection = sections.find((s) =>
        s.querySelector('h2')?.textContent?.includes('General'),
      );

      if (!winterSection || !summerSection || !generalSection) {
        throw new Error('Required sections not found');
      }

      const card = winterSection.querySelector('[data-resource-id]');
      if (!card) throw new Error('Card not found in winter section');
      const cardId = card.getAttribute('data-resource-id')!;

      const dt1 = new DataTransfer();
      card.dispatchEvent(
        new DragEvent('dragstart', {
          bubbles: true,
          cancelable: true,
          dataTransfer: dt1,
        }),
      );
      summerSection.dispatchEvent(
        new DragEvent('dragover', {
          bubbles: true,
          cancelable: true,
          dataTransfer: dt1,
        }),
      );
      summerSection.dispatchEvent(
        new DragEvent('drop', {
          bubbles: true,
          cancelable: true,
          dataTransfer: dt1,
        }),
      );
      card.dispatchEvent(
        new DragEvent('dragend', {
          bubbles: true,
          cancelable: true,
          dataTransfer: dt1,
        }),
      );

      await new Promise((r) => setTimeout(r, 100));

      const firstSummerCard = summerSection.querySelector('[data-resource-id]');
      if (
        winterSection.querySelectorAll(`[data-resource-id="${cardId}"]`)
          .length !== 1 ||
        summerSection.querySelectorAll(`[data-resource-id="${cardId}"]`)
          .length !== 1 ||
        firstSummerCard?.getAttribute('data-resource-id') !== cardId
      ) {
        throw new Error('Resource was not added to the front of Summer Games');
      }

      const winterCardNow = winterSection.querySelector(
        `[data-resource-id="${cardId}"]`,
      );
      const dt2 = new DataTransfer();
      winterCardNow?.dispatchEvent(
        new DragEvent('dragstart', {
          bubbles: true,
          cancelable: true,
          dataTransfer: dt2,
        }),
      );
      const main = document.querySelector('main');
      main?.dispatchEvent(
        new DragEvent('dragover', {
          bubbles: true,
          cancelable: true,
          clientX: 20,
          clientY: 20,
          dataTransfer: dt2,
        }),
      );
      main?.dispatchEvent(
        new DragEvent('drop', {
          bubbles: true,
          cancelable: true,
          clientX: 20,
          clientY: 20,
          dataTransfer: dt2,
        }),
      );
      winterCardNow?.dispatchEvent(
        new DragEvent('dragend', {
          bubbles: true,
          cancelable: true,
          clientX: 20,
          clientY: 20,
          dataTransfer: dt2,
        }),
      );

      await new Promise((r) => setTimeout(r, 100));

      if (
        winterSection.querySelectorAll(`[data-resource-id="${cardId}"]`)
          .length !== 0 ||
        summerSection.querySelectorAll(`[data-resource-id="${cardId}"]`)
          .length !== 1
      ) {
        throw new Error('Resource was not removed from Winter Games');
      }

      const summerCardNow = summerSection.querySelector(
        `[data-resource-id="${cardId}"]`,
      );
      const dt3 = new DataTransfer();
      summerCardNow?.dispatchEvent(
        new DragEvent('dragstart', {
          bubbles: true,
          cancelable: true,
          dataTransfer: dt3,
        }),
      );
      main?.dispatchEvent(
        new DragEvent('dragover', {
          bubbles: true,
          cancelable: true,
          clientX: 20,
          clientY: 20,
          dataTransfer: dt3,
        }),
      );
      main?.dispatchEvent(
        new DragEvent('drop', {
          bubbles: true,
          cancelable: true,
          clientX: 20,
          clientY: 20,
          dataTransfer: dt3,
        }),
      );
      summerCardNow?.dispatchEvent(
        new DragEvent('dragend', {
          bubbles: true,
          cancelable: true,
          clientX: 20,
          clientY: 20,
          dataTransfer: dt3,
        }),
      );

      await new Promise((r) => setTimeout(r, 100));

      if (
        summerSection.querySelectorAll(`[data-resource-id="${cardId}"]`)
          .length !== 0 ||
        generalSection.querySelectorAll(`[data-resource-id="${cardId}"]`)
          .length !== 1
      ) {
        throw new Error('Resource was not safely moved to General as fallback');
      }
    });
  });

  test('auto-scrolls the window when dragging near top or bottom edges', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/resources');

    const initialScrollY = await page.evaluate(() => window.scrollY);
    expect(initialScrollY).toBe(0);

    const triggerDragScroll = async (clientY: number) => {
      await page.evaluate(async (targetY) => {
        const dt = new DataTransfer();
        for (let i = 0; i < 30; i++) {
          window.dispatchEvent(
            new DragEvent('dragover', {
              bubbles: true,
              cancelable: true,
              clientY: targetY,
              dataTransfer: dt,
            }),
          );
          await new Promise((r) => setTimeout(r, 20));
        }
      }, clientY);
    };

    await triggerDragScroll(700);
    const scrolledDownY = await page.evaluate(() => window.scrollY);
    expect(scrolledDownY).toBeGreaterThan(0);

    await triggerDragScroll(20);
    const scrolledUpY = await page.evaluate(() => window.scrollY);
    expect(scrolledUpY).toBeLessThan(scrolledDownY);
  });

  test('displays trash symbol on the dragged resource replacing its contents when dragged over removal area', async ({
    page,
  }) => {
    await page.goto('/resources');
    await page.getByRole('button', { name: 'Edit' }).first().click();

    await expect(
      page.locator('[data-testid="drag-removal-symbol"]'),
    ).toHaveCount(0);

    const cardId = await page.evaluate(() => {
      const winterSection = Array.from(
        document.querySelectorAll('section'),
      ).find((s) =>
        s.querySelector('h2')?.textContent?.includes('Winter Games'),
      );
      const card = winterSection?.querySelector('[data-resource-id]');
      if (!card) throw new Error('Winter card not found');
      const dt = new DataTransfer();
      (window as unknown as { __testDt?: DataTransfer }).__testDt = dt;
      card.dispatchEvent(
        new DragEvent('dragstart', {
          bubbles: true,
          cancelable: true,
          dataTransfer: dt,
        }),
      );
      return card.getAttribute('data-resource-id')!;
    });

    const trackCard = page.locator(`[data-resource-id="${cardId}"]`).first();

    await expect(
      page.locator('[data-testid="drag-removal-symbol"]'),
    ).toHaveCount(0);

    await dragOverWhitespace(page);

    const removalSymbol = page.locator('[data-testid="drag-removal-symbol"]');
    await expect(removalSymbol).toBeVisible();
    await expect(removalSymbol).toContainText('Remove from Category');
    await expect(removalSymbol.locator('svg')).toBeVisible();
    await expect(trackCard).toHaveClass(/ring-red-500/);

    await dragOverSection(page, 'Summer Games');

    await expect(
      page.locator('[data-testid="drag-removal-symbol"]'),
    ).toHaveCount(0);

    await dragOverWhitespace(page);
    await expect(
      page.locator('[data-testid="drag-removal-symbol"]'),
    ).toBeVisible();

    await page.evaluate(() => {
      const dt =
        (window as unknown as { __testDt?: DataTransfer }).__testDt ||
        new DataTransfer();
      const main = document.querySelector('main');
      const sections = Array.from(document.querySelectorAll('section'));
      const winterSection = sections.find((s) =>
        s.querySelector('h2')?.textContent?.includes('Winter Games'),
      );
      const card = winterSection?.querySelector('[data-resource-id]');

      main?.dispatchEvent(
        new DragEvent('drop', {
          bubbles: true,
          cancelable: true,
          clientX: 400,
          clientY: 480,
          dataTransfer: dt,
        }),
      );
      card?.dispatchEvent(
        new DragEvent('dragend', {
          bubbles: true,
          cancelable: true,
          dataTransfer: dt,
        }),
      );
    });

    const winterSection = page.locator(
      'section:has(h2:has-text("Winter Games"))',
    );
    await expect(
      winterSection.locator(`[data-resource-id="${cardId}"]`),
    ).toHaveCount(0);
  });

  test('barely grabbing or moving a card slightly inside its category does NOT remove it', async ({
    page,
  }) => {
    const { winterSection, cards } = await setupWinterCards(page);
    const card0 = cards.first();
    const card0Id = await card0.getAttribute('data-resource-id');

    await page.evaluate(() => {
      const winter = Array.from(document.querySelectorAll('section')).find(
        (s) => s.querySelector('h2')?.textContent?.includes('Winter Games'),
      );
      const card = winter?.querySelector('[data-resource-id]');
      if (!card) throw new Error('Card missing');
      const dt = new DataTransfer();
      card.dispatchEvent(
        new DragEvent('dragstart', {
          bubbles: true,
          cancelable: true,
          dataTransfer: dt,
        }),
      );
      card.dispatchEvent(
        new DragEvent('dragend', {
          bubbles: true,
          cancelable: true,
          dataTransfer: dt,
        }),
      );
    });

    await expect(
      winterSection.locator(`[data-resource-id="${card0Id}"]`),
    ).toBeVisible();
  });

  test('cards are not draggable when not in edit mode', async ({ page }) => {
    await page.goto('/resources');

    const card = page.locator('[data-resource-id]').first();
    await expect(card).toHaveAttribute('draggable', 'false');

    await page.getByRole('button', { name: 'Edit' }).first().click();
    await expect(card).toHaveAttribute('draggable', 'true');
  });

  test('clicking category-level Delete button only deletes resources selected in that specific category', async ({
    page,
  }) => {
    await page.goto('/resources');
    await page.getByRole('button', { name: 'Edit' }).first().click();

    const winterSection = page.locator(
      'section:has(h2:has-text("Winter Games"))',
    );
    const summerSection = page.locator(
      'section:has(h2:has-text("Summer Games"))',
    );

    const winterCard = winterSection.locator('[data-resource-id]').first();
    const summerCard = summerSection.locator('[data-resource-id]').first();

    const winterCardId = await winterCard.getAttribute('data-resource-id');
    const summerCardId = await summerCard.getAttribute('data-resource-id');

    await winterCard.click();
    await summerCard.click();

    await expect(
      page.getByRole('button', { name: 'Delete (2)' }),
    ).toBeVisible();
    await expect(
      winterSection.getByRole('button', { name: 'Delete (1)' }),
    ).toBeVisible();
    await expect(
      summerSection.getByRole('button', { name: 'Delete (1)' }),
    ).toBeVisible();

    page.on('dialog', (dialog) => dialog.accept());
    await winterSection.getByRole('button', { name: 'Delete (1)' }).click();

    await expect(
      winterSection.locator(`[data-resource-id="${winterCardId}"]`),
    ).toHaveCount(0);
    await expect(
      summerSection.locator(`[data-resource-id="${summerCardId}"]`),
    ).toBeVisible();
    await expect(
      summerSection.getByRole('button', { name: 'Delete (1)' }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Delete (1)' }).first(),
    ).toBeVisible();
  });

  test('dragging horizontally on a selected resource expands and shrinks selection', async ({
    page,
  }) => {
    const { cards } = await setupWinterCards(page, 3);
    await cards.nth(0).click();
    await expect(
      page.getByRole('button', { name: 'Delete (1)' }).first(),
    ).toBeVisible();

    const [box0, , box2] = await getBoxes(cards, 3);
    const p0 = mid(box0);

    await page.mouse.move(p0.x, p0.y);
    await page.mouse.down();

    await page.mouse.move(box2.x + box2.width - 20, box2.y + box2.height / 2, {
      steps: 8,
    });
    await expect(
      page.getByRole('button', { name: 'Delete (3)' }).first(),
    ).toBeVisible();

    await page.mouse.move(box2.x + 20, box2.y + box2.height / 2, { steps: 5 });
    await expect(
      page.getByRole('button', { name: 'Delete (2)' }).first(),
    ).toBeVisible();

    await page.mouse.move(box2.x + box2.width - 20, box2.y + box2.height / 2, {
      steps: 5,
    });
    await expect(
      page.getByRole('button', { name: 'Delete (3)' }).first(),
    ).toBeVisible();

    await page.mouse.up();
  });

  test('when multiple resources are selected, dragging horizontally towards the other selected resources unselects them', async ({
    page,
  }) => {
    const { cards } = await setupWinterCards(page, 3);
    await cards.nth(0).click();
    await cards.nth(1).click();
    await cards.nth(2).click();
    await expect(
      page.getByRole('button', { name: 'Delete (3)' }).first(),
    ).toBeVisible();

    const [box0, box1, box2] = await getBoxes(cards, 3);
    const p2 = mid(box2);
    const p1 = mid(box1);
    const p0 = mid(box0);

    await page.mouse.move(p2.x, p2.y);
    await page.mouse.down();

    await page.mouse.move(box2.x + 20, p2.y, { steps: 5 });
    await expect(
      page.getByRole('button', { name: 'Delete (2)' }).first(),
    ).toBeVisible();

    await page.mouse.move(p1.x, p1.y, { steps: 8 });
    await expect(
      page.getByRole('button', { name: 'Delete (1)' }).first(),
    ).toBeVisible();

    await page.mouse.move(p0.x, p0.y, { steps: 8 });
    await expect(
      page.getByRole('button', { name: /Delete \(\d+\)/ }),
    ).toHaveCount(0);

    await page.mouse.move(p1.x, p1.y, { steps: 8 });
    await expect(
      page.getByRole('button', { name: 'Delete (2)' }).first(),
    ).toBeVisible();

    await page.mouse.move(box2.x + box2.width - 10, p2.y, { steps: 5 });
    await expect(
      page.getByRole('button', { name: 'Delete (3)' }).first(),
    ).toBeVisible();

    await page.mouse.up();
  });

  test('changing direction across the drag starting point dynamically toggles between unselecting and selecting', async ({
    page,
  }) => {
    const { cards } = await setupWinterCards(page, 3);
    await selectFirstTwo(page, cards);

    const [box0, box1, box2] = await getBoxes(cards, 3);
    const p1 = mid(box1);
    const p0 = mid(box0);
    const p2 = mid(box2);

    await page.mouse.move(p1.x, p1.y);
    await page.mouse.down();

    await page.mouse.move(p0.x, p0.y, { steps: 8 });
    await expectNoDeletes(page);

    await page.mouse.move(p2.x, p2.y, { steps: 12 });
    await expect(
      page.getByRole('button', { name: 'Delete (3)' }).first(),
    ).toBeVisible();

    await page.mouse.move(p0.x, p0.y, { steps: 12 });
    await expectNoDeletes(page);

    await page.mouse.up();
  });

  test('dragging across a selected group unselects them and continuing into unselected cards selects them', async ({
    page,
  }) => {
    const { cards } = await setupWinterCards(page, 4);
    await selectFirstTwo(page, cards);

    const [box0, box1, box2, box3] = await getBoxes(cards, 4);
    const p0 = mid(box0);
    const p1 = mid(box1);
    const p2 = mid(box2);
    const p3 = mid(box3);

    await page.mouse.move(p0.x, p0.y);
    await page.mouse.down();

    await page.mouse.move(p1.x, p1.y, { steps: 8 });
    await expectNoDeletes(page);

    await page.mouse.move(p2.x, p2.y, { steps: 8 });
    await expect(
      page.getByRole('button', { name: 'Delete (1)' }).first(),
    ).toBeVisible();
    await expect(
      cards.nth(2).getByRole('button', { name: 'Deselect resource' }),
    ).toBeVisible();

    await page.mouse.move(p3.x, p3.y, { steps: 8 });
    await expect(
      page.getByRole('button', { name: 'Delete (2)' }).first(),
    ).toBeVisible();
    await expect(
      cards.nth(2).getByRole('button', { name: 'Deselect resource' }),
    ).toBeVisible();
    await expect(
      cards.nth(3).getByRole('button', { name: 'Deselect resource' }),
    ).toBeVisible();

    await page.mouse.move(p1.x, p1.y, { steps: 10 });
    await expect(
      page.getByRole('button', { name: 'Delete (1)' }).first(),
    ).toBeVisible();

    await page.mouse.move(box0.x - 20, p0.y, { steps: 8 });
    await expect(
      page.getByRole('button', { name: 'Delete (2)' }).first(),
    ).toBeVisible();

    await page.mouse.up();
  });

  test('dragging vertically on a selected resource grabs selection and moves multiple to another category', async ({
    page,
  }) => {
    const { cards } = await setupWinterCards(page);
    const summerSection = page.locator(
      'section:has(h2:has-text("Summer Games"))',
    );
    const { id0, id1 } = await selectFirstTwo(page, cards);

    const [box0] = await getBoxes(cards, 1);
    const summerBox = await summerSection.boundingBox();
    if (!summerBox) throw new Error('Summer bounding box missing');

    const dragX = box0.x + box0.width / 2;
    await page.mouse.move(dragX, box0.y + box0.height / 2);
    await page.mouse.down();

    await page.mouse.move(dragX, box0.y + box0.height + 20, { steps: 5 });
    await expect(page.locator('text=2 items')).toBeVisible();

    await page.mouse.move(dragX, summerBox.y + 80, { steps: 10 });

    await expect(
      summerSection.getByText('+ Add 2 resources to Summer Games'),
    ).toBeVisible();

    await page.mouse.up();

    await expect(
      summerSection.locator(`[data-resource-id="${id0}"]`),
    ).toBeVisible();
    await expect(
      summerSection.locator(`[data-resource-id="${id1}"]`),
    ).toBeVisible();
  });

  test('dragging vertically on a selected resource out to removal area removes multiple from category', async ({
    page,
  }) => {
    const { winterSection, cards } = await setupWinterCards(page);
    const { id0, id1 } = await selectFirstTwo(page, cards);

    const [box0] = await getBoxes(cards, 1);

    await page.mouse.move(box0.x + box0.width / 2, box0.y + box0.height / 2);
    await page.mouse.down();

    await page.mouse.move(box0.x + box0.width / 2, 20, { steps: 10 });

    await expect(
      page.locator('[data-testid="drag-removal-symbol"]').first(),
    ).toBeVisible();
    await expect(page.getByText('Remove 2 from Category')).toBeVisible();

    await page.mouse.up();

    await expect(
      winterSection.locator(`[data-resource-id="${id0}"]`),
    ).toHaveCount(0);
    await expect(
      winterSection.locator(`[data-resource-id="${id1}"]`),
    ).toHaveCount(0);
  });
});
