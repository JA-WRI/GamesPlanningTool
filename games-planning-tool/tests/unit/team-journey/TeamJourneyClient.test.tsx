// AI contribution: 100% AI-generated
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MOCK_DISCIPLINES, MOCK_TEAM_SIZE } from './fixtures';

const mocks = vi.hoisted(() => ({
  saveTeamSize: vi.fn(),
}));

vi.mock('@/features/team-size/actions/teamSizeActions', () => ({
  saveTeamSize: mocks.saveTeamSize,
}));

vi.mock('@/features/team-size/components/TeamSizeStep', async () => {
  const React = await import('react');
  return {
    default: (props: {
      onTeamSizeSave: (value: typeof MOCK_TEAM_SIZE) => Promise<void>;
      onDisciplinesSave: (value: typeof MOCK_DISCIPLINES) => Promise<void>;
    }) =>
      React.createElement(
        'div',
        null,
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
  });

  it('updates local estimate state and persists through the server action', async () => {
    render(
      <TeamJourneyClient
        gameId="10"
        nsoId="nso-1"
        saved={{ teamSize: MOCK_TEAM_SIZE, disciplines: MOCK_DISCIPLINES }}
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
        saved={{ teamSize: MOCK_TEAM_SIZE, disciplines: MOCK_DISCIPLINES }}
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
        saved={{ teamSize: MOCK_TEAM_SIZE, disciplines: MOCK_DISCIPLINES }}
        draftKeys={draftKeys}
        initialDrafts={initialDrafts}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Save team size' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Your last change was not saved.',
    );
  });
});
