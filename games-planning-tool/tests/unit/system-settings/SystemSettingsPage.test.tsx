import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { GameSummary } from '@/lib/types';

vi.mock('@/features/system-settings/components/GameCard', () => ({
  default: ({
    game,
    sectionsDone,
  }: {
    game: { id: number; name: string };
    sectionsDone: number;
  }) => (
    <div data-testid="game-card" data-sections-done={sectionsDone}>
      {game.name}
    </div>
  ),
}));

vi.mock('@/features/system-settings/components/NewGameModal', () => ({
  default: ({ open, onClose }: { open: boolean; onClose: () => void }) =>
    open ? (
      <div data-testid="new-game-popup">
        <button type="button" onClick={onClose}>
          close popup
        </button>
      </div>
    ) : null,
}));

import SystemSettingsPage from '@/features/system-settings/components/SystemSettingsPage';

const makeGame = (
  id: number,
  name: string,
  isActive: boolean,
): GameSummary => ({
  id,
  name,
  country: 'Canada',
  city: 'Montreal',
  isActive,
  startDate: null,
  endDate: null,
  planningPeriodStart: null,
  planningPeriodEnd: null,
});

function setup(
  active: GameSummary[] = [],
  archived: GameSummary[] = [],
  sectionsDone: Record<number, number> = {},
) {
  return {
    user: userEvent.setup(),
    ...render(
      <SystemSettingsPage
        active={active}
        archived={archived}
        sectionsDone={sectionsDone}
      />,
    ),
  };
}

const activeTab = () => screen.getByRole('tab', { name: /^active/i });
const archivedTab = () => screen.getByRole('tab', { name: /^archived/i });

describe('SystemSettingsPage', () => {
  describe('heading and tabs', () => {
    it('shows the page heading', () => {
      setup();

      expect(
        screen.getByRole('heading', { name: /system configurations/i }),
      ).toBeInTheDocument();
    });

    it('shows the number of games in each tab label', () => {
      setup(
        [makeGame(1, 'A', true), makeGame(2, 'B', true)],
        [makeGame(3, 'C', false)],
      );

      expect(activeTab()).toHaveTextContent('Active (2)');
      expect(archivedTab()).toHaveTextContent('Archived (1)');
    });

    it('shows zero counts when there are no games', () => {
      setup();

      expect(activeTab()).toHaveTextContent('Active (0)');
      expect(archivedTab()).toHaveTextContent('Archived (0)');
    });

    it('starts on the Active tab', () => {
      setup();

      expect(activeTab()).toHaveAttribute('aria-selected', 'true');
      expect(archivedTab()).toHaveAttribute('aria-selected', 'false');
    });
  });

  describe('switching tabs', () => {
    it('shows only active games by default', () => {
      setup([makeGame(1, 'Active One', true)], [makeGame(2, 'Old One', false)]);

      expect(screen.getByText('Active One')).toBeInTheDocument();
      expect(screen.queryByText('Old One')).not.toBeInTheDocument();
    });

    it('shows only archived games after switching to Archived', async () => {
      const { user } = setup(
        [makeGame(1, 'Active One', true)],
        [makeGame(2, 'Old One', false)],
      );

      await user.click(archivedTab());

      expect(screen.getByText('Old One')).toBeInTheDocument();
      expect(screen.queryByText('Active One')).not.toBeInTheDocument();
      expect(archivedTab()).toHaveAttribute('aria-selected', 'true');
      expect(activeTab()).toHaveAttribute('aria-selected', 'false');
    });

    it('can switch back to Active', async () => {
      const { user } = setup(
        [makeGame(1, 'Active One', true)],
        [makeGame(2, 'Old One', false)],
      );

      await user.click(archivedTab());
      await user.click(activeTab());

      expect(screen.getByText('Active One')).toBeInTheDocument();
      expect(screen.queryByText('Old One')).not.toBeInTheDocument();
    });

    it('labels the visible panel with the selected tab', async () => {
      const { user } = setup();

      expect(screen.getByRole('tabpanel')).toHaveAccessibleName(/active/i);

      await user.click(archivedTab());

      expect(screen.getByRole('tabpanel')).toHaveAccessibleName(/archived/i);
    });
  });

  describe('game list', () => {
    it('renders one card per game', () => {
      setup([
        makeGame(1, 'A', true),
        makeGame(2, 'B', true),
        makeGame(3, 'C', true),
      ]);

      expect(screen.getAllByTestId('game-card')).toHaveLength(3);
    });

    it('keeps the order it was given', () => {
      setup([makeGame(1, 'First', true), makeGame(2, 'Second', true)]);

      const names = screen
        .getAllByTestId('game-card')
        .map((card) => card.textContent);
      expect(names).toEqual(['First', 'Second']);
    });

    it("passes each game's sections done to its card, defaulting to 0", () => {
      setup([makeGame(1, 'A', true), makeGame(2, 'B', true)], [], { 1: 4 });

      const done = screen
        .getAllByTestId('game-card')
        .map((card) => card.getAttribute('data-sections-done'));
      expect(done).toEqual(['4', '0']);
    });
  });

  describe('empty states', () => {
    it('shows a message when there are no active games', () => {
      setup([], [makeGame(2, 'Old One', false)]);

      expect(screen.getByText(/no active games/i)).toBeInTheDocument();
      expect(screen.queryByTestId('game-card')).not.toBeInTheDocument();
    });

    it('shows a message when there are no archived games', async () => {
      const { user } = setup([makeGame(1, 'Active One', true)], []);

      await user.click(archivedTab());

      expect(screen.getByText(/no archived games/i)).toBeInTheDocument();
      expect(screen.queryByTestId('game-card')).not.toBeInTheDocument();
    });

    it('does not show the empty message when there are games', () => {
      setup([makeGame(1, 'A', true)]);

      expect(screen.queryByText(/no active games/i)).not.toBeInTheDocument();
    });
  });

  describe('new game popup', () => {
    it('is closed initially', () => {
      setup();

      expect(screen.queryByTestId('new-game-popup')).not.toBeInTheDocument();
    });

    it('opens when New Game is clicked', async () => {
      const { user } = setup();

      await user.click(screen.getByRole('button', { name: /new game/i }));

      expect(screen.getByTestId('new-game-popup')).toBeInTheDocument();
    });

    it('closes when the popup asks to close', async () => {
      const { user } = setup();

      await user.click(screen.getByRole('button', { name: /new game/i }));
      await user.click(screen.getByRole('button', { name: 'close popup' }));

      expect(screen.queryByTestId('new-game-popup')).not.toBeInTheDocument();
    });

    it('can be opened again after closing', async () => {
      const { user } = setup();
      const open = () => screen.getByRole('button', { name: /new game/i });

      await user.click(open());
      await user.click(screen.getByRole('button', { name: 'close popup' }));
      await user.click(open());

      expect(screen.getByTestId('new-game-popup')).toBeInTheDocument();
    });
  });
});
