import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('@/app/(application)/admin/system-settings/_lib/createGame', () => ({
  createGame: vi.fn(),
}));

import { createGame } from '@/app/(application)/admin/system-settings/_lib/createGame';
import NewGamePopup from '@/app/(application)/admin/system-settings/_components/NewGamePopup';

const createGameMock = vi.mocked(createGame);

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

function setup(props: Partial<React.ComponentProps<typeof NewGamePopup>> = {}) {
  const onClose = vi.fn();
  const utils = render(<NewGamePopup open onClose={onClose} {...props} />);
  return { onClose, user: userEvent.setup(), ...utils };
}

const nameInput = () => screen.getByPlaceholderText('Enter Game Name');
const countryInput = () => screen.getByPlaceholderText('Country');
const cityInput = () => screen.getByPlaceholderText('City');
const createButton = () => screen.getByRole('button', { name: /^create$/i });
const cancelButton = () => screen.getByRole('button', { name: /cancel/i });

async function fillForm(
  user: ReturnType<typeof userEvent.setup>,
  values = { name: 'Test Game', country: 'Canada', city: 'Montreal' },
) {
  await user.type(nameInput(), values.name);
  await user.type(countryInput(), values.country);
  await user.type(cityInput(), values.city);
}

// After a failed submit the error shows before the transition finishes,
// so wait until the controls are usable again before interacting.
const waitUntilIdle = () =>
  waitFor(() => {
    expect(cancelButton()).toBeEnabled();
    expect(createButton()).toBeEnabled();
  });

describe('NewGamePopup', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('visibility', () => {
    it('renders nothing when closed', () => {
      setup({ open: false });

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('shows a dialog with the form when open', () => {
      setup();

      expect(
        screen.getByRole('dialog', { name: /create a new game/i }),
      ).toBeInTheDocument();
      expect(nameInput()).toBeInTheDocument();
      expect(countryInput()).toBeInTheDocument();
      expect(cityInput()).toBeInTheDocument();
    });

    it('starts with empty fields and focus on the name field', () => {
      setup();

      expect(nameInput()).toHaveValue('');
      expect(countryInput()).toHaveValue('');
      expect(cityInput()).toHaveValue('');
      expect(nameInput()).toHaveFocus();
    });
  });

  describe('closing without submitting', () => {
    it('closes on Cancel and does not create a game', async () => {
      const { user, onClose } = setup();

      await user.click(cancelButton());

      expect(onClose).toHaveBeenCalledTimes(1);
      expect(createGameMock).not.toHaveBeenCalled();
    });

    it('closes on Escape', async () => {
      const { user, onClose } = setup();

      await user.keyboard('{Escape}');

      expect(onClose).toHaveBeenCalledTimes(1);
      expect(createGameMock).not.toHaveBeenCalled();
    });

    it('closes when the backdrop is clicked', async () => {
      const { user, onClose } = setup();

      await user.click(screen.getByRole('dialog').parentElement!);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not close when the form itself is clicked', async () => {
      const { user, onClose } = setup();

      await user.click(screen.getByRole('dialog'));

      expect(onClose).not.toHaveBeenCalled();
    });

    it('clears the fields when cancelled', async () => {
      const { user } = setup();
      await fillForm(user);

      await user.click(cancelButton());

      expect(nameInput()).toHaveValue('');
      expect(countryInput()).toHaveValue('');
      expect(cityInput()).toHaveValue('');
    });
  });

  describe('submitting', () => {
    it('sends the entered values to createGame', async () => {
      createGameMock.mockResolvedValue({ ok: true });
      const { user } = setup();
      await fillForm(user, {
        name: 'Summer Games',
        country: 'USA',
        city: 'Los Angeles',
      });

      await user.click(createButton());

      await waitFor(() =>
        expect(createGameMock).toHaveBeenCalledWith({
          name: 'Summer Games',
          country: 'USA',
          city: 'Los Angeles',
        }),
      );
      expect(createGameMock).toHaveBeenCalledTimes(1);
    });

    it('submits when Enter is pressed in a field', async () => {
      createGameMock.mockResolvedValue({ ok: true });
      const { user } = setup();
      await fillForm(user);

      await user.type(cityInput(), '{Enter}');

      await waitFor(() => expect(createGameMock).toHaveBeenCalledTimes(1));
    });

    it('closes and clears the form after a successful create', async () => {
      createGameMock.mockResolvedValue({ ok: true });
      const { user, onClose } = setup();
      await fillForm(user);

      await user.click(createButton());

      await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      expect(nameInput()).toHaveValue('');
    });

    it('shows the error, stays open and keeps the values when it fails', async () => {
      createGameMock.mockResolvedValue({
        ok: false,
        error: 'All fields are required.',
      });
      const { user, onClose } = setup();
      await fillForm(user);

      await user.click(createButton());

      expect(await screen.findByRole('alert')).toHaveTextContent(
        'All fields are required.',
      );
      expect(onClose).not.toHaveBeenCalled();
      expect(nameInput()).toHaveValue('Test Game');
      expect(countryInput()).toHaveValue('Canada');
      expect(cityInput()).toHaveValue('Montreal');
    });

    it('lets the user retry after a failure and clears the old error', async () => {
      createGameMock
        .mockResolvedValueOnce({ ok: false, error: 'Try again later.' })
        .mockResolvedValueOnce({ ok: true });
      const { user, onClose } = setup();
      await fillForm(user);

      await user.click(createButton());
      await screen.findByRole('alert');
      await waitUntilIdle();
      await user.click(createButton());

      await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
      expect(createGameMock).toHaveBeenCalledTimes(2);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('does not show a stale error after cancelling', async () => {
      createGameMock.mockResolvedValue({ ok: false, error: 'Nope.' });
      const { user } = setup();
      await fillForm(user);

      await user.click(createButton());
      await screen.findByRole('alert');
      await waitUntilIdle();
      await user.click(cancelButton());

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('while a create is in progress', () => {
    it('disables the fields and buttons and shows a pending label', async () => {
      const pending = deferred<{ ok: true }>();
      createGameMock.mockReturnValue(pending.promise);
      const { user, onClose } = setup();
      await fillForm(user);

      await user.click(createButton());

      const busy = await screen.findByRole('button', { name: /creating/i });
      expect(busy).toBeDisabled();
      expect(cancelButton()).toBeDisabled();
      expect(nameInput()).toBeDisabled();
      expect(countryInput()).toBeDisabled();
      expect(cityInput()).toBeDisabled();

      pending.resolve({ ok: true });
      await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    });

    it('ignores Escape and backdrop clicks until it finishes', async () => {
      const pending = deferred<{ ok: true }>();
      createGameMock.mockReturnValue(pending.promise);
      const { user, onClose } = setup();
      await fillForm(user);

      await user.click(createButton());
      await screen.findByRole('button', { name: /creating/i });

      await user.keyboard('{Escape}');
      await user.click(screen.getByRole('dialog').parentElement!);
      expect(onClose).not.toHaveBeenCalled();

      pending.resolve({ ok: true });
      await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    });
  });
});
