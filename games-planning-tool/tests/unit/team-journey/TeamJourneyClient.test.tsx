// AI contribution: 100% AI-generated
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MOCK_DISCIPLINES, MOCK_TEAM_SIZE } from './fixtures';

const mocks = vi.hoisted(() => ({
  saveTeamSize: vi.fn(),
  saveMedalRows: vi.fn(),
}));

vi.mock('@/features/team-size/actions/teamSizeActions', () => ({
  saveTeamSize: mocks.saveTeamSize,
}));
vi.mock('@/features/team-size/actions/medalPotentialActions', () => ({
  saveMedalRows: mocks.saveMedalRows,
}));

vi.mock('@/features/team-size/components/TeamSizeStep', async () => {
  const React = await import('react');
  return {
    default: (props: {
      onTeamSizeSave: (value: typeof MOCK_TEAM_SIZE) => Promise<void>;
      onDisciplinesSave: (value: typeof MOCK_DISCIPLINES) => Promise<void>;
      onMedalRowsSave: (value: []) => Promise<void>;
      teamSize: typeof MOCK_TEAM_SIZE;
      disciplines: typeof MOCK_DISCIPLINES;
    }) =>
      React.createElement(
        'div',
        null,
        React.createElement(
          'span',
          { 'data-testid': 'saved-team-notes' },
          props.teamSize.notes,
        ),
        React.createElement(
          'span',
          { 'data-testid': 'saved-discipline-notes' },
          props.disciplines.notes,
        ),
        React.createElement(
          'button',
          {
            onClick: () =>
              void props
                .onTeamSizeSave({ ...MOCK_TEAM_SIZE, notes: 'failed team' })
                .catch(() => undefined),
          },
          'Save changed team size',
        ),
        React.createElement(
          'button',
          {
            onClick: () =>
              void props
                .onDisciplinesSave({
                  ...MOCK_DISCIPLINES,
                  notes: 'failed discipline',
                })
                .catch(() => undefined),
          },
          'Save changed disciplines',
        ),
        React.createElement(
          'button',
          {
            onClick: () =>
              void props.onTeamSizeSave(MOCK_TEAM_SIZE).catch(() => undefined),
          },
          'Save team size',
        ),
        React.createElement(
          'button',
          {
            onClick: () =>
              void props
                .onDisciplinesSave(MOCK_DISCIPLINES)
                .catch(() => undefined),
          },
          'Save disciplines',
        ),
        React.createElement(
          'button',
          {
            onClick: () =>
              void props.onMedalRowsSave([]).catch(() => undefined),
          },
          'Save medals',
        ),
      ),
  };
});

import TeamJourneyClient from '@/app/(application)/[gameId]/[nsoId]/team-journey/_components/TeamJourneyClient';

const draftKeys = {
  estimate: 'estimate',
  disciplines: 'disciplines',
  performance: 'performance',
  medalPotential: 'medal-potential',
  estimateNotes: 'estimate-notes',
  disciplineNotes: 'discipline-notes',
};

const initialDrafts = {};

describe('TeamJourneyClient save integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.saveTeamSize.mockResolvedValue({ ok: true });
    mocks.saveMedalRows.mockResolvedValue({ ok: true });
  });

  it('updates local estimate state and persists through the server action', async () => {
    render(
      <TeamJourneyClient
        gameId="10"
        nsoId="nso-1"
        saved={{
          teamSize: MOCK_TEAM_SIZE,
          disciplines: MOCK_DISCIPLINES,
          medalRows: [],
        }}
        draftKeys={draftKeys}
        initialDrafts={initialDrafts}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Save team size' }));

    await waitFor(() => {
      expect(mocks.saveTeamSize).toHaveBeenCalledWith(
        '10',
        'nso-1',
        MOCK_TEAM_SIZE,
        MOCK_DISCIPLINES,
      );
    });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows failure and rejects the callback when the server declines the save', async () => {
    mocks.saveTeamSize.mockResolvedValue({ ok: false });
    const view = render(
      <TeamJourneyClient
        gameId="10"
        nsoId="nso-1"
        saved={{
          teamSize: MOCK_TEAM_SIZE,
          disciplines: MOCK_DISCIPLINES,
          medalRows: [],
        }}
        draftKeys={draftKeys}
        initialDrafts={initialDrafts}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Save disciplines' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Your last change was not saved.',
    );
    expect(mocks.saveTeamSize).toHaveBeenCalledOnce();

    view.unmount();
  });

  it('shows failure and propagates rejected server errors', async () => {
    mocks.saveTeamSize.mockRejectedValue(new Error('database unavailable'));
    render(
      <TeamJourneyClient
        gameId="10"
        nsoId="nso-1"
        saved={{
          teamSize: MOCK_TEAM_SIZE,
          disciplines: MOCK_DISCIPLINES,
          medalRows: [],
        }}
        draftKeys={draftKeys}
        initialDrafts={initialDrafts}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Save team size' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Your last change was not saved.',
    );
  });

  it('persists medals and reports rejected saves', async () => {
    mocks.saveMedalRows.mockResolvedValue({ ok: false });
    render(
      <TeamJourneyClient
        gameId="10"
        nsoId="nso-1"
        saved={{
          teamSize: MOCK_TEAM_SIZE,
          disciplines: MOCK_DISCIPLINES,
          medalRows: [],
        }}
        draftKeys={draftKeys}
        initialDrafts={initialDrafts}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Save medals' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Your last change was not saved.',
    );
    expect(mocks.saveMedalRows).toHaveBeenCalledWith('10', 'nso-1', []);
  });

  it('does not send failed team-size edits when disciplines are saved later', async () => {
    mocks.saveTeamSize.mockResolvedValueOnce({ ok: false });
    render(
      <TeamJourneyClient
        gameId="10"
        nsoId="nso-1"
        saved={{
          teamSize: MOCK_TEAM_SIZE,
          disciplines: MOCK_DISCIPLINES,
          medalRows: [],
        }}
        draftKeys={draftKeys}
        initialDrafts={initialDrafts}
      />,
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Save changed team size' }),
    );
    await screen.findByRole('alert');
    expect(screen.getByTestId('saved-team-notes')).toHaveTextContent(
      MOCK_TEAM_SIZE.notes,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Save disciplines' }));
    await waitFor(() => expect(mocks.saveTeamSize).toHaveBeenCalledTimes(2));
    expect(mocks.saveTeamSize).toHaveBeenLastCalledWith(
      '10',
      'nso-1',
      MOCK_TEAM_SIZE,
      MOCK_DISCIPLINES,
    );
  });

  it('does not send failed discipline edits when team size is saved later', async () => {
    mocks.saveTeamSize.mockRejectedValueOnce(new Error('offline'));
    render(
      <TeamJourneyClient
        gameId="10"
        nsoId="nso-1"
        saved={{
          teamSize: MOCK_TEAM_SIZE,
          disciplines: MOCK_DISCIPLINES,
          medalRows: [],
        }}
        draftKeys={draftKeys}
        initialDrafts={initialDrafts}
      />,
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Save changed disciplines' }),
    );
    await screen.findByRole('alert');
    expect(screen.getByTestId('saved-discipline-notes')).toHaveTextContent(
      MOCK_DISCIPLINES.notes,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Save team size' }));
    await waitFor(() => expect(mocks.saveTeamSize).toHaveBeenCalledTimes(2));
    expect(mocks.saveTeamSize).toHaveBeenLastCalledWith(
      '10',
      'nso-1',
      MOCK_TEAM_SIZE,
      MOCK_DISCIPLINES,
    );
  });
});
