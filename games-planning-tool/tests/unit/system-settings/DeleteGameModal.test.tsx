import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('@/features/system-settings/actions/deleteGame', () => ({
  deleteGame: vi.fn(),
}));

import { deleteGame } from '@/features/system-settings/actions/deleteGame';
import DeleteGameModal from '@/features/system-settings/components/DeleteGameModal';

const deleteGameMock = vi.mocked(deleteGame);

// Lets a test control exactly when the server action resolves.
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

function setup(
  props: Partial<React.ComponentProps<typeof DeleteGameModal>> = {},
) {
  const onClose = vi.fn();
  const utils = render(
    <DeleteGameModal
      gameId={7}
      gameName="Test Game"
      open
      onClose={onClose}
      {...props}
    />,
  );
  return { onClose, user: userEvent.setup(), ...utils };
}

const deleteButton = () => screen.getByRole('button', { name: /^delete$/i });
const cancelButton = () => screen.getByRole('button', { name: /cancel/i });

const waitUntilIdle = () =>
  waitFor(() => {
    expect(cancelButton()).toBeEnabled();
    expect(deleteButton()).toBeEnabled();
  });

describe('DeleteGameModal', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('visibility', () => {
    it('renders nothing when closed', () => {
      setup({ open: false });

      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });

    it('shows a confirmation naming the game when open', () => {
      setup({ gameName: 'Summer Games 2028' });

      expect(
        screen.getByRole('alertdialog', { name: /delete game\?/i }),
      ).toBeInTheDocument();
      expect(screen.getByText('Summer Games 2028')).toBeInTheDocument();
    });
  });

  describe('closing without deleting', () => {
    it('closes on Cancel and does not delete', async () => {
      const { user, onClose } = setup();

      await user.click(cancelButton());

      expect(onClose).toHaveBeenCalledTimes(1);
      expect(deleteGameMock).not.toHaveBeenCalled();
    });

    it('closes on Escape', async () => {
      const { user, onClose } = setup();

      await user.keyboard('{Escape}');

      expect(onClose).toHaveBeenCalledTimes(1);
      expect(deleteGameMock).not.toHaveBeenCalled();
    });

    it('closes when the backdrop is clicked', async () => {
      const { user, onClose } = setup();
      const backdrop = screen.getByRole('alertdialog').parentElement!;

      await user.click(backdrop);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not close when the popup itself is clicked', async () => {
      const { user, onClose } = setup();

      await user.click(screen.getByRole('alertdialog'));

      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('deleting', () => {
    it('calls deleteGame with the game id', async () => {
      deleteGameMock.mockResolvedValue({ ok: true });
      const { user } = setup({ gameId: 42 });

      await user.click(deleteButton());

      await waitFor(() => expect(deleteGameMock).toHaveBeenCalledWith(42));
      expect(deleteGameMock).toHaveBeenCalledTimes(1);
    });

    it('closes after a successful delete', async () => {
      deleteGameMock.mockResolvedValue({ ok: true });
      const { user, onClose } = setup();

      await user.click(deleteButton());

      await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('shows the error and stays open when the delete fails', async () => {
      deleteGameMock.mockResolvedValue({
        ok: false,
        error: 'This game has linked data.',
      });
      const { user, onClose } = setup();

      await user.click(deleteButton());

      expect(await screen.findByRole('alert')).toHaveTextContent(
        'This game has linked data.',
      );
      expect(onClose).not.toHaveBeenCalled();
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });

    it('lets the user try again after a failure', async () => {
      deleteGameMock
        .mockResolvedValueOnce({ ok: false, error: 'Try again later.' })
        .mockResolvedValueOnce({ ok: true });
      const { user, onClose } = setup();

      await user.click(deleteButton());
      await screen.findByRole('alert');
      await waitUntilIdle();
      await user.click(deleteButton());

      await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
      expect(deleteGameMock).toHaveBeenCalledTimes(2);
    });
  });

  describe('while a delete is in progress', () => {
    it('disables both buttons and shows a pending label', async () => {
      const pending = deferred<{ ok: true }>();
      deleteGameMock.mockReturnValue(pending.promise);
      const { user, onClose } = setup();

      await user.click(deleteButton());

      const busy = await screen.findByRole('button', { name: /deleting/i });
      expect(busy).toBeDisabled();
      expect(cancelButton()).toBeDisabled();

      pending.resolve({ ok: true });
      await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    });

    it('ignores Escape and backdrop clicks until it finishes', async () => {
      const pending = deferred<{ ok: true }>();
      deleteGameMock.mockReturnValue(pending.promise);
      const { user, onClose } = setup();

      await user.click(deleteButton());
      await screen.findByRole('button', { name: /deleting/i });

      await user.keyboard('{Escape}');
      await user.click(screen.getByRole('alertdialog').parentElement!);
      expect(onClose).not.toHaveBeenCalled();

      pending.resolve({ ok: true });
      await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    });
  });

  describe('error state is cleared on close', () => {
    it('does not show a stale error when reopened', async () => {
      deleteGameMock.mockResolvedValue({ ok: false, error: 'Nope.' });
      const { user, onClose, rerender } = setup();

      await user.click(deleteButton());
      await screen.findByRole('alert');
      await waitUntilIdle();
      await user.click(cancelButton());
      expect(onClose).toHaveBeenCalledTimes(1);

      // Parent closes, then reopens the popup.
      rerender(
        <DeleteGameModal
          gameId={7}
          gameName="Test Game"
          open={false}
          onClose={onClose}
        />,
      );
      rerender(
        <DeleteGameModal
          gameId={7}
          gameName="Test Game"
          open
          onClose={onClose}
        />,
      );

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });
});
