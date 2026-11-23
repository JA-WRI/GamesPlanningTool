import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { GameSummary } from '@/lib/types';

vi.mock('@/features/system-settings/actions/setGameActive', () => ({
  setGameActive: vi.fn(),
}));

// The popup has its own tests; here we only check GameCard drives it.
vi.mock('@/features/system-settings/components/DeleteGamePopup', () => ({
  default: ({
    open,
    gameId,
    gameName,
    onClose,
  }: {
    open: boolean;
    gameId: number;
    gameName: string;
    onClose: () => void;
  }) =>
    open ? (
      <div data-testid="delete-popup">
        <span>{`${gameId}:${gameName}`}</span>
        <button type="button" onClick={onClose}>
          close popup
        </button>
      </div>
    ) : null,
}));

import { setGameActive } from '@/features/system-settings/actions/setGameActive';
import GameCard from '@/features/system-settings/components/GameCard';

const setGameActiveMock = vi.mocked(setGameActive);

const makeGame = (overrides: Partial<GameSummary> = {}): GameSummary => ({
  id: 7,
  name: 'Test Game',
  country: 'Canada',
  city: 'Montreal',
  isActive: true,
  startDate: null,
  endDate: null,
  planningPeriodStart: null,
  planningPeriodEnd: null,
  ...overrides,
});

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

function setup(overrides: Partial<GameSummary> = {}) {
  const game = makeGame(overrides);
  return { game, user: userEvent.setup(), ...render(<GameCard game={game} />) };
}

describe('GameCard', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('content', () => {
    it('shows the game name and location', () => {
      setup({ name: 'Summer Games 2028', city: 'Los Angeles', country: 'USA' });

      expect(screen.getByText('Summer Games 2028')).toBeInTheDocument();
      expect(screen.getByText('Los Angeles, USA')).toBeInTheDocument();
    });

    it("links View Configurations to the game's setup pages", () => {
      setup({ id: 42 });

      expect(
        screen.getByRole('link', { name: 'View Configurations' }),
      ).toHaveAttribute('href', '/admin/system-settings/42');
    });

    it('shows "Not set" for both date ranges when there are no dates', () => {
      setup();

      expect(screen.getAllByText('Not set')).toHaveLength(2);
    });

    it('shows the formatted date ranges when dates exist', () => {
      setup({
        startDate: '2028-07-14T00:00:00.000Z',
        endDate: '2028-07-30T00:00:00.000Z',
        planningPeriodStart: '2027-06-01T00:00:00.000Z',
        planningPeriodEnd: '2028-05-01T00:00:00.000Z',
      });

      expect(
        screen.getByText('Jul 14, 2028 – Jul 30, 2028'),
      ).toBeInTheDocument();
      expect(screen.getByText('Jun 1, 2027 – May 1, 2028')).toBeInTheDocument();
      expect(screen.queryByText('Not set')).not.toBeInTheDocument();
    });

    it('shows TBD for a missing end of a range', () => {
      setup({ startDate: '2028-07-14T00:00:00.000Z' });

      expect(screen.getByText('Jul 14, 2028 – TBD')).toBeInTheDocument();
    });

    it('does not shift date-only values to the previous day', () => {
      setup({
        startDate: '2028-01-01T00:00:00.000Z',
        endDate: '2028-01-02T00:00:00.000Z',
      });

      expect(screen.getByText('Jan 1, 2028 – Jan 2, 2028')).toBeInTheDocument();
    });
  });

  describe('archive / restore', () => {
    it('offers Archive for an active game and archives it', async () => {
      setGameActiveMock.mockResolvedValue({ ok: true });
      const { user } = setup({ id: 42, name: 'G', isActive: true });

      await user.click(screen.getByRole('button', { name: 'Archive G' }));

      await waitFor(() =>
        expect(setGameActiveMock).toHaveBeenCalledWith(42, false),
      );
      expect(setGameActiveMock).toHaveBeenCalledTimes(1);
    });

    it('offers Restore for an archived game and reactivates it', async () => {
      setGameActiveMock.mockResolvedValue({ ok: true });
      const { user } = setup({ id: 42, name: 'G', isActive: false });

      expect(
        screen.queryByRole('button', { name: 'Archive G' }),
      ).not.toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'Restore G' }));

      await waitFor(() =>
        expect(setGameActiveMock).toHaveBeenCalledWith(42, true),
      );
    });

    it('disables the button while the request is running', async () => {
      const pending = deferred<{ ok: true }>();
      setGameActiveMock.mockReturnValue(pending.promise);
      const { user } = setup({ name: 'G' });

      await user.click(screen.getByRole('button', { name: 'Archive G' }));

      await waitFor(() =>
        expect(
          screen.getByRole('button', { name: 'Archive G' }),
        ).toBeDisabled(),
      );

      pending.resolve({ ok: true });
      await waitFor(() =>
        expect(screen.getByRole('button', { name: 'Archive G' })).toBeEnabled(),
      );
    });

    it('shows the error when the update fails', async () => {
      setGameActiveMock.mockResolvedValue({
        ok: false,
        error: 'This game no longer exists.',
      });
      const { user } = setup({ name: 'G' });

      await user.click(screen.getByRole('button', { name: 'Archive G' }));

      expect(await screen.findByRole('alert')).toHaveTextContent(
        'This game no longer exists.',
      );
    });

    it('clears the previous error when trying again', async () => {
      setGameActiveMock
        .mockResolvedValueOnce({ ok: false, error: 'Try again.' })
        .mockResolvedValueOnce({ ok: true });
      const { user } = setup({ name: 'G' });
      const archive = () => screen.getByRole('button', { name: 'Archive G' });

      await user.click(archive());
      await screen.findByRole('alert');
      await waitFor(() => expect(archive()).toBeEnabled());
      await user.click(archive());

      await waitFor(() =>
        expect(screen.queryByRole('alert')).not.toBeInTheDocument(),
      );
    });
  });

  describe('delete', () => {
    it('does not show the delete popup initially', () => {
      setup();

      expect(screen.queryByTestId('delete-popup')).not.toBeInTheDocument();
    });

    it('opens the delete popup for this game', async () => {
      const { user } = setup({ id: 9, name: 'Doomed Game' });

      await user.click(
        screen.getByRole('button', { name: 'Delete Doomed Game' }),
      );

      expect(screen.getByTestId('delete-popup')).toHaveTextContent(
        '9:Doomed Game',
      );
    });

    it('closes the delete popup when it asks to close', async () => {
      const { user } = setup({ name: 'G' });

      await user.click(screen.getByRole('button', { name: 'Delete G' }));
      await user.click(screen.getByRole('button', { name: 'close popup' }));

      expect(screen.queryByTestId('delete-popup')).not.toBeInTheDocument();
    });

    it('does not archive or delete anything just by opening the popup', async () => {
      const { user } = setup({ name: 'G' });

      await user.click(screen.getByRole('button', { name: 'Delete G' }));

      expect(setGameActiveMock).not.toHaveBeenCalled();
    });
  });
});
