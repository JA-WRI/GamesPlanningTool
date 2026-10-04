# Testing Guide

This project uses two testing frameworks that cover different layers of the app:

| Framework      | Type of test                             | Folder        |
| -------------- | ---------------------------------------- | ------------- |
| **Vitest**     | Unit tests, logic tests, component tests | `tests/unit/` |
| **Playwright** | End-to-end (E2E) tests, full user flows  | `tests/e2e/`  |

![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-2EAD33?style=for-the-badge&logo=playwright&logoColor=white)

---

## Use Case for Each framework

- Vitest -> Unit test
- Playwright -> E2E test

---

## Running the tests

### Vitest (unit tests)

```bash
# Run all unit tests once and exit (used in CI)
npm run test

# Run in watch mode — re-runs tests as you edit files (use this while developing)
npm run test:watch
```

Test files live in `tests/unit/` and must be named `*.test.ts` or `*.test.tsx`. Vitest will automatically discover any file matching that pattern inside the folder.

### Playwright (E2E tests)

Before running Playwright tests, make sure Postgres is running locally:

```bash
docker compose up -d
```

Then run the tests:

```bash
# Run all E2E tests, headless, across Chromium/Firefox/WebKit
npx playwright test

# Run tests with the interactive UI (useful for debugging)
npx playwright test --ui

# Run only on Chromium (faster, useful while writing a new test)
npx playwright test --project=chromium

# Run a specific test file
npx playwright test tests/e2e/homepage.spec.ts

# Run in debug mode (step through a test)
npx playwright test --debug
```

You do **not** need to manually start the dev server first — Playwright is configured to start `npm run dev` automatically and wait for it to be ready (see `webServer` in `playwright.config.ts`). It will reuse an already-running dev server locally if you have one open in another terminal.

Test files live in `tests/e2e/` and must be named `*.spec.ts`.

### Viewing the Playwright HTML report

After a run, you can view a detailed report (including screenshots/traces for any failures):

```bash
npx playwright show-report
```

---

## Prerequisites

| Requirement                                              | Needed for                                                                                    |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Node.js                                                  | Both frameworks                                                                               |
| Docker Desktop + `docker compose up -d`                  | Playwright (your app needs Postgres to run most pages)                                        |
| Playwright browsers installed (`npx playwright install`) | Playwright — already done as part of initial setup, but needed again on a fresh machine/clone |

---

## Where tests run automatically (CI)

Both frameworks run automatically in GitHub Actions on every push/PR to `main` and `dev` (see `.github/workflows/ci.yml`):

- **`unit-tests` job** — runs `npm run test` (Vitest)
- **`e2e-tests` job** — spins up a temporary, isolated Postgres database, applies migrations, then runs `npx playwright test`

If Playwright tests fail in CI, an HTML report is uploaded as a downloadable artifact on that workflow run so you can see screenshots/traces of what went wrong.

---

## Writing a new test — quick templates

### Vitest unit test template

```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from '@/lib/myFunction';

describe('myFunction', () => {
  it('does the expected thing', () => {
    expect(myFunction(input)).toBe(expectedOutput);
  });
});
```

### Playwright E2E test template

```typescript
import { test, expect } from '@playwright/test';

test('describes what the user does and expects', async ({ page }) => {
  await page.goto('/some-page');
  await expect(page.getByRole('heading')).toHaveText('Expected Heading');
});
```
