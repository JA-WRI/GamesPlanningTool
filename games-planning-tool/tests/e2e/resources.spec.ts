import { test, expect } from '@playwright/test';

test.describe('Resources Page E2E', () => {
  test('renders topbar, navbar, category sections, and cards', async ({
    page,
  }) => {
    await page.goto('/resources');

    // Verify topbar
    await expect(page.getByText('Games Planning Tool')).toBeVisible();
    await expect(page.getByText('Alex Dunphy')).toBeVisible();

    // Verify categories
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

    // Click Edit button
    const editBtn = page.getByRole('button', { name: 'Edit' }).first();
    await editBtn.click();

    // Edit button changes to Done
    await expect(
      page.getByRole('button', { name: 'Done' }).first(),
    ).toBeVisible();

    // Select a card
    const card = page.locator('[data-resource-id]').first();
    await card.click();

    // Verify Delete button shows count (use .first() since both global and category buttons match)
    await expect(
      page.getByRole('button', { name: /Delete \(1\)/ }).first(),
    ).toBeVisible();
  });

  test('automatically assigns General category when adding resource with no category', async ({
    page,
  }) => {
    await page.goto('/resources');

    // Open Add modal
    await page.getByRole('button', { name: 'Add' }).first().click();
    await expect(page.getByText('Add New Resource')).toBeVisible();

    // Fill name & URL
    await page.fill(
      'input[placeholder="e.g. LA 2028 Team Roster Guide"]',
      'E2E Test Handbook',
    );
    await page.fill(
      'input[placeholder="https://olympic.ca/handbook"]',
      'https://olympic.ca/e2e-handbook',
    );

    // Submit with NO category selected
    await page.getByRole('button', { name: 'Add Resource' }).click();

    // Verify it appeared in General section
    const generalSection = page.locator('section:has(h2:has-text("General"))');
    await expect(generalSection.getByText('E2E Test Handbook')).toBeVisible();
  });

  test('supports directional sweep selection and reversing direction', async ({
    page,
  }) => {
    await page.goto('/resources');

    const catSection = page.locator('section').first();
    await catSection.getByRole('button', { name: 'Edit' }).click();

    const cards = catSection.locator('[data-resource-id]');
    const card1 = cards.nth(0);
    const card2 = cards.nth(1);
    const card3 = cards.nth(2);

    const roundBtn1 = card1.locator('button').first();
    const r1Box = await roundBtn1.boundingBox();
    const b2 = await card2.boundingBox();
    const b3 = await card3.boundingBox();

    if (!r1Box || !b2 || !b3) throw new Error('Card bounding boxes not found');

    // Drag forward from card 1 round button to the right side of card 3
    await page.mouse.move(r1Box.x + 10, r1Box.y + 10);
    await page.mouse.down();
    await page.mouse.move(b3.x + b3.width - 20, b3.y + b3.height / 2, {
      steps: 8,
    });

    // Should have 3 selected
    await expect(
      catSection.getByRole('button', { name: 'Delete (3)' }),
    ).toBeVisible();

    // Start reversing left while STILL inside card 3: should unselect card 3 immediately
    await page.mouse.move(b3.x + 20, b3.y + b3.height / 2, {
      steps: 5,
    });
    await expect(
      catSection.getByRole('button', { name: 'Delete (2)' }),
    ).toBeVisible();

    // Change direction back to the right while STILL inside card 3: should re-select card 3
    await page.mouse.move(b3.x + b3.width - 20, b3.y + b3.height / 2, {
      steps: 5,
    });
    await expect(
      catSection.getByRole('button', { name: 'Delete (3)' }),
    ).toBeVisible();

    // Reverse drag back left to card 2: moving left over card 2 unselects it as well
    await page.mouse.move(b2.x + b2.width / 2, b2.y + b2.height / 2, {
      steps: 8,
    });
    await expect(
      catSection.getByRole('button', { name: 'Delete (1)' }),
    ).toBeVisible();

    // Move slightly right on card 2: reselects card 2
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

    // Dragging is only allowed in edit mode
    await page.getByRole('button', { name: 'Edit' }).first().click();
    await expect(page.getByRole('button', { name: 'Done' }).first()).toBeVisible();

    // Perform cross-category drag and drop
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

      // 1. Drag from Winter Games to Summer Games
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

      // Verify card is now in both Winter and Summer, and at the FRONT of Summer
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

      // 2. Drag out of Winter Games (drop outside)
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

      // Verify card is removed from Winter, remains in Summer
      if (
        winterSection.querySelectorAll(`[data-resource-id="${cardId}"]`)
          .length !== 0 ||
        summerSection.querySelectorAll(`[data-resource-id="${cardId}"]`)
          .length !== 1
      ) {
        throw new Error('Resource was not removed from Winter Games');
      }

      // 3. Drag out of Summer Games (only category left -> moves to front of General)
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

      // Verify card is removed from Summer and added to the front of General
      const firstGeneralCard =
        generalSection.querySelector('[data-resource-id]');
      if (
        summerSection.querySelectorAll(`[data-resource-id="${cardId}"]`)
          .length !== 0 ||
        generalSection.querySelectorAll(`[data-resource-id="${cardId}"]`)
          .length !== 1 ||
        firstGeneralCard?.getAttribute('data-resource-id') !== cardId
      ) {
        throw new Error('Resource did not fall back to front of General');
      }

      // 4. Drag out of General -> stays in General!
      const generalCardNow = generalSection.querySelector(
        `[data-resource-id="${cardId}"]`,
      );
      const dt4 = new DataTransfer();
      generalCardNow?.dispatchEvent(
        new DragEvent('dragstart', {
          bubbles: true,
          cancelable: true,
          dataTransfer: dt4,
        }),
      );
      main?.dispatchEvent(
        new DragEvent('dragover', {
          bubbles: true,
          cancelable: true,
          clientX: 20,
          clientY: 20,
          dataTransfer: dt4,
        }),
      );
      main?.dispatchEvent(
        new DragEvent('drop', {
          bubbles: true,
          cancelable: true,
          clientX: 20,
          clientY: 20,
          dataTransfer: dt4,
        }),
      );
      generalCardNow?.dispatchEvent(
        new DragEvent('dragend', {
          bubbles: true,
          cancelable: true,
          clientX: 20,
          clientY: 20,
          dataTransfer: dt4,
        }),
      );

      await new Promise((r) => setTimeout(r, 100));

      if (
        generalSection.querySelectorAll(`[data-resource-id="${cardId}"]`)
          .length !== 1
      ) {
        throw new Error('Resource should stay in General when dragged out of it');
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

    // Simulate drag near the bottom edge (clientY = 700 on a 720px viewport)
    await page.evaluate(async () => {
      const dt = new DataTransfer();
      for (let i = 0; i < 25; i++) {
        window.dispatchEvent(
          new DragEvent('dragover', {
            bubbles: true,
            cancelable: true,
            clientY: 700,
            dataTransfer: dt,
          }),
        );
        await new Promise((r) => setTimeout(r, 16));
      }
    });

    const scrolledDownY = await page.evaluate(() => window.scrollY);
    expect(scrolledDownY).toBeGreaterThan(50);

    // Simulate drag near the top edge (clientY = 20)
    await page.evaluate(async () => {
      const dt = new DataTransfer();
      for (let i = 0; i < 25; i++) {
        window.dispatchEvent(
          new DragEvent('dragover', {
            bubbles: true,
            cancelable: true,
            clientY: 20,
            dataTransfer: dt,
          }),
        );
        await new Promise((r) => setTimeout(r, 16));
      }
    });

    const scrolledUpY = await page.evaluate(() => window.scrollY);
    expect(scrolledUpY).toBeLessThan(scrolledDownY);
  });

  test('displays trash symbol on the dragged resource replacing its contents when dragged over removal area', async ({
    page,
  }) => {
    await page.goto('/resources');

    // Dragging is only allowed in edit mode
    await page.getByRole('button', { name: 'Edit' }).first().click();

    // 1. Initial state: removal symbol should not be visible anywhere
    await expect(page.locator('[data-testid="drag-removal-symbol"]')).toHaveCount(0);

    // 2. Start dragging a card from Winter Games
    const cardId = await page.evaluate(() => {
      const sections = Array.from(document.querySelectorAll('section'));
      const winterSection = sections.find((s) =>
        s.querySelector('h2')?.textContent?.includes('Winter Games'),
      );
      if (!winterSection) throw new Error('Winter section not found');
      const card = winterSection.querySelector('[data-resource-id]');
      if (!card) throw new Error('Card not found in winter section');

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

    // 3. Initially while inside category section, removal symbol is not active
    await expect(page.locator('[data-testid="drag-removal-symbol"]')).toHaveCount(0);

    // 4. Drag over whitespace outside category sections (e.g. main / window)
    await page.evaluate(() => {
      const dt = (window as unknown as { __testDt?: DataTransfer }).__testDt || new DataTransfer();
      const main = document.querySelector('main');
      main?.dispatchEvent(
        new DragEvent('dragover', {
          bubbles: true,
          cancelable: true,
          clientX: 400,
          clientY: 480,
          dataTransfer: dt,
        }),
      );
    });

    // The dragged card floating in whitespace should now have its contents replaced by the trash removal symbol
    const removalSymbol = page.locator('[data-testid="drag-removal-symbol"]');
    await expect(removalSymbol).toBeVisible();
    await expect(removalSymbol).toContainText('Remove from Category');
    await expect(removalSymbol.locator('svg')).toBeVisible();

    // The card being dragged has the removal ring style
    await expect(trackCard).toHaveClass(/ring-red-500/);

    // 5. Drag back over a category section (e.g. Summer Games)
    await page.evaluate(() => {
      const dt = (window as unknown as { __testDt?: DataTransfer }).__testDt || new DataTransfer();
      const sections = Array.from(document.querySelectorAll('section'));
      const summerSection = sections.find((s) =>
        s.querySelector('h2')?.textContent?.includes('Summer Games'),
      );
      summerSection?.dispatchEvent(
        new DragEvent('dragover', {
          bubbles: true,
          cancelable: true,
          dataTransfer: dt,
        }),
      );
    });

    // Once hovering over a valid category section, the removal symbol is gone (contents restored)
    await expect(page.locator('[data-testid="drag-removal-symbol"]')).toHaveCount(0);

    // 6. Drag back over whitespace outside sections
    await page.evaluate(() => {
      const dt = (window as unknown as { __testDt?: DataTransfer }).__testDt || new DataTransfer();
      const main = document.querySelector('main');
      main?.dispatchEvent(
        new DragEvent('dragover', {
          bubbles: true,
          cancelable: true,
          clientX: 400,
          clientY: 480,
          dataTransfer: dt,
        }),
      );
    });

    await expect(page.locator('[data-testid="drag-removal-symbol"]')).toBeVisible();

    // 7. Drop in whitespace outside category sections
    await page.evaluate(() => {
      const dt = (window as unknown as { __testDt?: DataTransfer }).__testDt || new DataTransfer();
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

    // After dropping outside, card is removed from Winter Games and toast confirms
    await expect(page.locator('[data-testid="drag-removal-symbol"]')).toHaveCount(0);
    const toast = page.locator('.animate-slide-up');
    await expect(toast).toBeVisible();
    await expect(toast).toContainText('Removed from Winter Games');
  });

  test('barely grabbing or moving a card slightly inside its category does NOT remove it', async ({
    page,
  }) => {
    await page.goto('/resources');

    const winterSection = page.locator('section:has(h2:has-text("Winter Games"))');
    const initialCount = await winterSection.locator('[data-resource-id]').count();
    const firstCard = winterSection.locator('[data-resource-id]').first();
    const initialCardId = await firstCard.getAttribute('data-resource-id');

    // Simulate clicking or barely grabbing with mouse
    const box = await firstCard.boundingBox();
    if (!box) throw new Error('First card bounding box not found');

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    // Barely move 4 pixels (slight grab)
    await page.mouse.move(box.x + box.width / 2 + 4, box.y + box.height / 2 + 4);
    await page.mouse.up();

    // Verify it is NOT removed
    await expect(winterSection.locator('[data-resource-id]')).toHaveCount(initialCount);
    await expect(winterSection.locator(`[data-resource-id="${initialCardId}"]`)).toBeVisible();
  });

  test('cards are not draggable when not in edit mode', async ({ page }) => {
    await page.goto('/resources');

    const firstCard = page.locator('[data-resource-id]').first();
    await expect(firstCard).toHaveAttribute('draggable', 'false');

    // Turn on Edit mode
    await page.getByRole('button', { name: 'Edit' }).first().click();
    await expect(firstCard).toHaveAttribute('draggable', 'true');
  });

  test('clicking category-level Delete button only deletes resources selected in that specific category', async ({
    page,
  }) => {
    await page.goto('/resources');

    // Turn on Global Edit
    await page.getByRole('button', { name: 'Edit' }).first().click();

    const winterSection = page.locator('section:has(h2:has-text("Winter Games"))');
    const summerSection = page.locator('section:has(h2:has-text("Summer Games"))');

    const winterCard = winterSection.locator('[data-resource-id]').first();
    const summerCard = summerSection.locator('[data-resource-id]').first();

    const winterCardId = await winterCard.getAttribute('data-resource-id');
    const summerCardId = await summerCard.getAttribute('data-resource-id');

    // Select 1 card in Winter Games and 1 card in Summer Games
    await winterCard.click();
    await summerCard.click();

    // Verify global Delete says Delete (2), Winter says Delete (1), Summer says Delete (1)
    await expect(page.getByRole('button', { name: 'Delete (2)' })).toBeVisible();
    await expect(winterSection.getByRole('button', { name: 'Delete (1)' })).toBeVisible();
    await expect(summerSection.getByRole('button', { name: 'Delete (1)' })).toBeVisible();

    // Auto-accept window.confirm
    page.on('dialog', (dialog) => dialog.accept());

    // Click Winter Games Delete (1)
    await winterSection.getByRole('button', { name: 'Delete (1)' }).click();

    // Winter card is deleted, Summer card remains selected!
    await expect(winterSection.locator(`[data-resource-id="${winterCardId}"]`)).toHaveCount(0);
    await expect(summerSection.locator(`[data-resource-id="${summerCardId}"]`)).toBeVisible();
    await expect(summerSection.getByRole('button', { name: 'Delete (1)' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Delete (1)' }).first()).toBeVisible();
  });

  test('dragging horizontally on a selected resource expands and shrinks selection', async ({
    page,
  }) => {
    await page.goto('/resources');

    // Turn on Edit mode
    await page.getByRole('button', { name: 'Edit' }).first().click();

    const winterSection = page.locator('section:has(h2:has-text("Winter Games"))');
    const cards = winterSection.locator('[data-resource-id]');
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(3);

    // Select the first card by clicking it
    await cards.nth(0).click();
    await expect(page.getByRole('button', { name: 'Delete (1)' }).first()).toBeVisible();

    const box0 = await cards.nth(0).boundingBox();
    const box1 = await cards.nth(1).boundingBox();
    const box2 = await cards.nth(2).boundingBox();

    if (!box0 || !box1 || !box2) throw new Error('Bounding boxes missing');

    // Start drag on the center of the first card (not on the round button)
    await page.mouse.move(box0.x + box0.width / 2, box0.y + box0.height / 2);
    await page.mouse.down();

    // Drag forward from card 0 horizontally to the right side of card 2
    await page.mouse.move(box2.x + box2.width - 20, box2.y + box2.height / 2, { steps: 8 });
    await expect(page.getByRole('button', { name: 'Delete (3)' }).first()).toBeVisible();

    // Start reversing left while STILL inside card 2: should unselect card 2 immediately
    await page.mouse.move(box2.x + 20, box2.y + box2.height / 2, { steps: 5 });
    await expect(page.getByRole('button', { name: 'Delete (2)' }).first()).toBeVisible();

    // Re-advance right on card 2: reselects card 2
    await page.mouse.move(box2.x + box2.width - 20, box2.y + box2.height / 2, { steps: 5 });
    await expect(page.getByRole('button', { name: 'Delete (3)' }).first()).toBeVisible();

    await page.mouse.up();
  });

  test('when multiple resources are selected, dragging horizontally towards the other selected resources unselects them', async ({
    page,
  }) => {
    await page.goto('/resources');

    // Turn on Edit mode
    await page.getByRole('button', { name: 'Edit' }).first().click();

    const winterSection = page.locator('section:has(h2:has-text("Winter Games"))');
    const cards = winterSection.locator('[data-resource-id]');
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(3);

    // Select cards 0, 1, and 2 by clicking them
    await cards.nth(0).click();
    await cards.nth(1).click();
    await cards.nth(2).click();
    await expect(page.getByRole('button', { name: 'Delete (3)' }).first()).toBeVisible();

    const box0 = await cards.nth(0).boundingBox();
    const box1 = await cards.nth(1).boundingBox();
    const box2 = await cards.nth(2).boundingBox();

    if (!box0 || !box1 || !box2) throw new Error('Bounding boxes missing');

    // Start drag on card 2 (the rightmost selected card) and drag left towards card 1 & card 0
    await page.mouse.move(box2.x + box2.width / 2, box2.y + box2.height / 2);
    await page.mouse.down();

    // Drag slightly left inside card 2: card 2 is unselected immediately!
    await page.mouse.move(box2.x + 20, box2.y + box2.height / 2, { steps: 5 });
    await expect(page.getByRole('button', { name: 'Delete (2)' }).first()).toBeVisible();

    // Drag left into card 1: both card 2 and card 1 are unselected
    await page.mouse.move(box1.x + box1.width / 2, box1.y + box1.height / 2, { steps: 8 });
    await expect(page.getByRole('button', { name: 'Delete (1)' }).first()).toBeVisible();

    // Continue dragging left into card 0: all 3 cards are unselected
    await page.mouse.move(box0.x + box0.width / 2, box0.y + box0.height / 2, { steps: 8 });
    await expect(page.getByRole('button', { name: /Delete \(\d+\)/ })).toHaveCount(0);

    // Reverse direction (retreating right towards card 1): cards 0 and 1 are re-selected!
    await page.mouse.move(box1.x + box1.width / 2, box1.y + box1.height / 2, { steps: 8 });
    await expect(page.getByRole('button', { name: 'Delete (2)' }).first()).toBeVisible();

    // Retreat past startX: card 2 is re-selected too, restoring all 3!
    await page.mouse.move(box2.x + box2.width - 10, box2.y + box2.height / 2, { steps: 5 });
    await expect(page.getByRole('button', { name: 'Delete (3)' }).first()).toBeVisible();

    await page.mouse.up();
  });

  test('changing direction across the drag starting point dynamically toggles between unselecting and selecting', async ({
    page,
  }) => {
    await page.goto('/resources');

    // Turn on Edit mode
    await page.getByRole('button', { name: 'Edit' }).first().click();

    const winterSection = page.locator('section:has(h2:has-text("Winter Games"))');
    const cards = winterSection.locator('[data-resource-id]');
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(3);

    // Select cards 0 and 1 (leaving card 2 unselected)
    await cards.nth(0).click();
    await cards.nth(1).click();
    await expect(page.getByRole('button', { name: 'Delete (2)' }).first()).toBeVisible();

    const box0 = await cards.nth(0).boundingBox();
    const box1 = await cards.nth(1).boundingBox();
    const box2 = await cards.nth(2).boundingBox();

    if (!box0 || !box1 || !box2) throw new Error('Bounding boxes missing');

    // Start dragging on card 1 (the middle selected card)
    await page.mouse.move(box1.x + box1.width / 2, box1.y + box1.height / 2);
    await page.mouse.down();

    // Drag left into card 0: unselects card 1 and card 0!
    await page.mouse.move(box0.x + box0.width / 2, box0.y + box0.height / 2, { steps: 8 });
    await expect(page.getByRole('button', { name: /Delete \(\d+\)/ })).toHaveCount(0);

    // Reverse right, passing over card 1 (the starting card) onto unselected card 2:
    // Switches dynamically to SELECT mode, selecting all 3 cards!
    await page.mouse.move(box2.x + box2.width / 2, box2.y + box2.height / 2, { steps: 12 });
    await expect(page.getByRole('button', { name: 'Delete (3)' }).first()).toBeVisible();

    // Reverse left back over card 1 to card 0:
    // Shrinks selection, crosses start card, and switches back to UNSELECT mode!
    await page.mouse.move(box0.x + box0.width / 2, box0.y + box0.height / 2, { steps: 12 });
    await expect(page.getByRole('button', { name: /Delete \(\d+\)/ })).toHaveCount(0);

    await page.mouse.up();
  });

  test('dragging across a selected group unselects them and continuing into unselected cards selects them', async ({
    page,
  }) => {
    await page.goto('/resources');

    // Turn on Edit mode
    await page.getByRole('button', { name: 'Edit' }).first().click();

    const winterSection = page.locator('section:has(h2:has-text("Winter Games"))');
    const cards = winterSection.locator('[data-resource-id]');
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(4);

    // Select card 0 and card 1 (cards 2 and 3 are unselected)
    await cards.nth(0).click();
    await cards.nth(1).click();
    await expect(page.getByRole('button', { name: 'Delete (2)' }).first()).toBeVisible();

    const box0 = await cards.nth(0).boundingBox();
    const box1 = await cards.nth(1).boundingBox();
    const box2 = await cards.nth(2).boundingBox();
    const box3 = await cards.nth(3).boundingBox();

    if (!box0 || !box1 || !box2 || !box3) throw new Error('Bounding boxes missing');

    // Start dragging on card 0
    await page.mouse.move(box0.x + box0.width / 2, box0.y + box0.height / 2);
    await page.mouse.down();

    // Drag over card 1: unselects both card 0 and card 1
    await page.mouse.move(box1.x + box1.width / 2, box1.y + box1.height / 2, { steps: 8 });
    await expect(page.getByRole('button', { name: /Delete \(\d+\)/ })).toHaveCount(0);

    // Continue dragging forward to card 2 (which is unselected): card 2 becomes selected!
    await page.mouse.move(box2.x + box2.width / 2, box2.y + box2.height / 2, { steps: 8 });
    await expect(page.getByRole('button', { name: 'Delete (1)' }).first()).toBeVisible();
    await expect(cards.nth(2).getByRole('button', { name: 'Deselect resource' })).toBeVisible();

    // Continue dragging forward to card 3 (which is unselected): card 3 becomes selected too!
    await page.mouse.move(box3.x + box3.width / 2, box3.y + box3.height / 2, { steps: 8 });
    await expect(page.getByRole('button', { name: 'Delete (2)' }).first()).toBeVisible();
    await expect(cards.nth(2).getByRole('button', { name: 'Deselect resource' })).toBeVisible();
    await expect(cards.nth(3).getByRole('button', { name: 'Deselect resource' })).toBeVisible();

    // Reverse left back over card 2 to card 1: cards 3 and 2 are unselected, card 1 is re-selected!
    await page.mouse.move(box1.x + box1.width / 2, box1.y + box1.height / 2, { steps: 10 });
    await expect(page.getByRole('button', { name: 'Delete (1)' }).first()).toBeVisible();

    // Reverse left past card 0: restores original snapshot (cards 0 and 1 selected)
    await page.mouse.move(box0.x - 20, box0.y + box0.height / 2, { steps: 8 });
    await expect(page.getByRole('button', { name: 'Delete (2)' }).first()).toBeVisible();

    await page.mouse.up();
  });

  test('dragging vertically on a selected resource grabs selection and moves multiple to another category', async ({
    page,
  }) => {
    await page.goto('/resources');

    // Turn on Edit mode
    await page.getByRole('button', { name: 'Edit' }).first().click();

    const winterSection = page.locator('section:has(h2:has-text("Winter Games"))');
    const summerSection = page.locator('section:has(h2:has-text("Summer Games"))');

    const card0 = winterSection.locator('[data-resource-id]').nth(0);
    const card1 = winterSection.locator('[data-resource-id]').nth(1);

    const id0 = await card0.getAttribute('data-resource-id');
    const id1 = await card1.getAttribute('data-resource-id');

    // Select both cards
    await card0.click();
    await card1.click();
    await expect(page.getByRole('button', { name: 'Delete (2)' }).first()).toBeVisible();

    const box0 = await card0.boundingBox();
    const summerBox = await summerSection.boundingBox();

    if (!box0 || !summerBox) throw new Error('Bounding boxes missing');

    // Grab selection vertically by dragging straight down from card0 into summerSection
    const dragX = box0.x + box0.width / 2;
    await page.mouse.move(dragX, box0.y + box0.height / 2);
    await page.mouse.down();

    // Move slightly down (inside Winter Games) to check multi-drag avatar contains count
    await page.mouse.move(dragX, box0.y + box0.height + 20, { steps: 5 });
    await expect(page.locator('text=2 items')).toBeVisible();

    // Move straight down vertically into summerSection (keeping X constant so dx = 0)
    await page.mouse.move(
      dragX,
      summerBox.y + 80,
      { steps: 10 },
    );

    // Verify hover cue displays "+ Add 2 resources to Summer Games"
    await expect(summerSection.getByText('+ Add 2 resources to Summer Games')).toBeVisible();

    // Release drop
    await page.mouse.up();

    // Verify both resources are now present in Summer Games
    await expect(summerSection.locator(`[data-resource-id="${id0}"]`)).toBeVisible();
    await expect(summerSection.locator(`[data-resource-id="${id1}"]`)).toBeVisible();
  });

  test('dragging vertically on a selected resource out to removal area removes multiple from category', async ({
    page,
  }) => {
    await page.goto('/resources');

    // Turn on Edit mode
    await page.getByRole('button', { name: 'Edit' }).first().click();

    const winterSection = page.locator('section:has(h2:has-text("Winter Games"))');
    const card0 = winterSection.locator('[data-resource-id]').nth(0);
    const card1 = winterSection.locator('[data-resource-id]').nth(1);

    const id0 = await card0.getAttribute('data-resource-id');
    const id1 = await card1.getAttribute('data-resource-id');

    // Select both cards
    await card0.click();
    await card1.click();
    await expect(page.getByRole('button', { name: 'Delete (2)' }).first()).toBeVisible();

    const box0 = await card0.boundingBox();
    if (!box0) throw new Error('Bounding box missing');

    // Drag vertically up towards the top of the page (outside category sections)
    await page.mouse.move(box0.x + box0.width / 2, box0.y + box0.height / 2);
    await page.mouse.down();

    // Move to top of viewport
    await page.mouse.move(box0.x + box0.width / 2, 20, { steps: 10 });

    // Verify removal symbol
    await expect(page.locator('[data-testid="drag-removal-symbol"]').first()).toBeVisible();
    await expect(page.getByText('Remove 2 from Category')).toBeVisible();

    // Release mouse
    await page.mouse.up();

    // Verify both items are removed from Winter Games
    await expect(winterSection.locator(`[data-resource-id="${id0}"]`)).toHaveCount(0);
    await expect(winterSection.locator(`[data-resource-id="${id1}"]`)).toHaveCount(0);
  });
});

