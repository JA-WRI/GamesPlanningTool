// AI contribution: 50% or more AI-generated
import type { ComponentProps } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TeamJourneyClient from '@/app/(application)/[gameId]/[nsoId]/team-journey/_components/TeamJourneyClient';
import type TeamSizeStep from '@/features/team-size/components/TeamSizeStep';
import { saveTeamSize } from '@/features/team-size/actions/teamSizeActions';
import { saveMedalRows } from '@/features/team-size/actions/medalPotentialActions';
import { MOCK_DISCIPLINES, MOCK_TEAM_SIZE } from './fixtures';

const { saveRejected } = vi.hoisted(() => ({ saveRejected: vi.fn() }));

vi.mock('@/features/team-size/actions/teamSizeActions', () => ({
  saveTeamSize: vi.fn(),
}));
vi.mock('@/features/team-size/actions/medalPotentialActions', () => ({
  saveMedalRows: vi.fn(),
}));

// Exercise the client's state and server-action wiring independently of grid editing.
vi.mock('@/features/team-size/components/TeamSizeStep', () => ({
  default: (props: ComponentProps<typeof TeamSizeStep>) => (
    <div>
      <output aria-label="Team notes">{props.teamSize.notes}</output>
      <output aria-label="Discipline notes">{props.disciplines.notes}</output>
      <output aria-label="Medal notes">
        {props.medalRows.map((row) => row.notes).join(', ')}
      </output>
      <button
        onClick={() =>
          Promise.resolve(
            props.onTeamSizeSave({
              ...props.teamSize,
              notes: 'Updated team notes',
            }),
          ).catch(saveRejected)
        }
      >
        Save team size
      </button>
      <button
        onClick={() =>
          Promise.resolve(
            props.onDisciplinesSave({
              ...props.disciplines,
              notes: 'Updated discipline notes',
            }),
          ).catch(saveRejected)
        }
      >
        Save disciplines
      </button>
      <button
        onClick={() =>
          Promise.resolve(
            props.onMedalRowsSave(
              props.medalRows.map((row) => ({
                ...row,
                notes: 'Updated medal notes',
              })),
            ),
          ).catch(saveRejected)
        }
      >
        Save medals
      </button>
    </div>
  ),
}));

const GAME_ID = '1';
const NSO_ID = 'b9f0193f-2e62-4141-bffb-ffa3c7f9e9d7';
const SAVED = {
  teamSize: MOCK_TEAM_SIZE,
  disciplines: MOCK_DISCIPLINES,
  medalRows: [
    {
      id: '3f2b8c1e-5d4a-4e6f-9a7b-1c2d3e4f5a6b',
      firstName: 'Alex',
      lastName: 'Martin',
      event: '400m',
      medalPotential: 'MP' as const,
      notes: 'Saved medal notes',
    },
  ],
};

function renderClient() {
  render(
    <TeamJourneyClient
      gameId={GAME_ID}
      nsoId={NSO_ID}
      saved={SAVED}
      draftKeys={{
        estimate: 'estimate',
        disciplines: 'disciplines',
        performance: 'performance',
        medalPotential: 'medal-potential',
        estimateNotes: 'estimate-notes',
        disciplineNotes: 'discipline-notes',
      }}
      initialDrafts={{}}
    />,
  );
  return userEvent.setup();
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(saveTeamSize).mockResolvedValue({ ok: true });
  vi.mocked(saveMedalRows).mockResolvedValue({ ok: true });
});

describe('TeamJourneyClient', () => {
  it('loads saved data without triggering a save', () => {
    renderClient();

    expect(screen.getByLabelText('Team notes')).toHaveTextContent(
      MOCK_TEAM_SIZE.notes,
    );
    expect(screen.getByLabelText('Discipline notes')).toHaveTextContent(
      MOCK_DISCIPLINES.notes,
    );
    expect(screen.getByLabelText('Medal notes')).toHaveTextContent(
      'Saved medal notes',
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(saveTeamSize).not.toHaveBeenCalled();
    expect(saveMedalRows).not.toHaveBeenCalled();
  });

  it('saves team size and disciplines with the latest values for the selected game and NSO', async () => {
    const user = renderClient();
    const teamSize = { ...MOCK_TEAM_SIZE, notes: 'Updated team notes' };
    const disciplines = {
      ...MOCK_DISCIPLINES,
      notes: 'Updated discipline notes',
    };

    await user.click(screen.getByRole('button', { name: 'Save team size' }));
    expect(saveTeamSize).toHaveBeenLastCalledWith(
      GAME_ID,
      NSO_ID,
      teamSize,
      MOCK_DISCIPLINES,
    );
    expect(screen.getByLabelText('Team notes')).toHaveTextContent(
      teamSize.notes,
    );

    await user.click(screen.getByRole('button', { name: 'Save disciplines' }));
    expect(saveTeamSize).toHaveBeenLastCalledWith(
      GAME_ID,
      NSO_ID,
      teamSize,
      disciplines,
    );
    expect(screen.getByLabelText('Discipline notes')).toHaveTextContent(
      disciplines.notes,
    );

    await user.click(screen.getByRole('button', { name: 'Save team size' }));
    expect(saveTeamSize).toHaveBeenLastCalledWith(
      GAME_ID,
      NSO_ID,
      teamSize,
      disciplines,
    );
    expect(saveMedalRows).not.toHaveBeenCalled();
  });

  it('updates medal rows and saves them independently of team size', async () => {
    const user = renderClient();
    await user.click(screen.getByRole('button', { name: 'Save medals' }));

    expect(saveMedalRows).toHaveBeenCalledExactlyOnceWith(GAME_ID, NSO_ID, [
      { ...SAVED.medalRows[0], notes: 'Updated medal notes' },
    ]);
    expect(screen.getByLabelText('Medal notes')).toHaveTextContent(
      'Updated medal notes',
    );
    expect(saveTeamSize).not.toHaveBeenCalled();
  });

  it.each([
    ['Save team size', 'refused'],
    ['Save team size', 'rejected'],
    ['Save disciplines', 'refused'],
    ['Save disciplines', 'rejected'],
    ['Save medals', 'refused'],
    ['Save medals', 'rejected'],
  ])(
    'shows a %s failure (%s) and clears it after a successful retry',
    async (button, failure) => {
      const save =
        button === 'Save medals'
          ? vi.mocked(saveMedalRows)
          : vi.mocked(saveTeamSize);
      if (failure === 'refused') save.mockResolvedValueOnce({ ok: false });
      else save.mockRejectedValueOnce(new Error('Database unavailable'));
      const user = renderClient();

      await user.click(screen.getByRole('button', { name: button }));
      expect(await screen.findByRole('alert')).toHaveTextContent(
        'Your last change was not saved. Please try again.',
      );
      expect(saveRejected).toHaveBeenCalledExactlyOnceWith(expect.any(Error));
      expect(screen.getByLabelText('Team notes')).toHaveTextContent(
        MOCK_TEAM_SIZE.notes,
      );
      expect(screen.getByLabelText('Discipline notes')).toHaveTextContent(
        MOCK_DISCIPLINES.notes,
      );
      expect(screen.getByLabelText('Medal notes')).toHaveTextContent(
        'Saved medal notes',
      );

      await user.click(screen.getByRole('button', { name: button }));
      await waitFor(() =>
        expect(screen.queryByRole('alert')).not.toBeInTheDocument(),
      );
      expect(save).toHaveBeenCalledTimes(2);
    },
  );

  it.each([
    ['Save team size', 'Save disciplines', 'refused'],
    ['Save disciplines', 'Save team size', 'rejected'],
  ])(
    'does not include failed edits from %s in a later %s save',
    async (failedButton, nextButton, failure) => {
      if (failure === 'refused')
        vi.mocked(saveTeamSize).mockResolvedValueOnce({ ok: false });
      else vi.mocked(saveTeamSize).mockRejectedValueOnce(new Error('offline'));
      const user = renderClient();
      await user.click(screen.getByRole('button', { name: failedButton }));
      await screen.findByRole('alert');

      await user.click(screen.getByRole('button', { name: nextButton }));
      expect(saveTeamSize).toHaveBeenLastCalledWith(
        GAME_ID,
        NSO_ID,
        nextButton === 'Save team size'
          ? { ...MOCK_TEAM_SIZE, notes: 'Updated team notes' }
          : MOCK_TEAM_SIZE,
        nextButton === 'Save disciplines'
          ? { ...MOCK_DISCIPLINES, notes: 'Updated discipline notes' }
          : MOCK_DISCIPLINES,
      );
      await waitFor(() =>
        expect(screen.queryByRole('alert')).not.toBeInTheDocument(),
      );
    },
  );
});
