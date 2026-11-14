// AI contribution:Below 50% AI-generated
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTeamJourneyState } from '@/app/(application)/[gameId]/[nsoId]/team-journey/_components/useTeamJourneyState';
import { INITIAL_TEAM_SIZE } from '@/features/team-size/lib/constants';
import { MOCK_DISCIPLINES, MOCK_TEAM_SIZE } from './fixtures';

// one athlete as the page gets it from the db
const MEDAL_ROW = {
  id: '3f2b8c1e-5d4a-4e6f-9a7b-1c2d3e4f5a6b',
  firstName: 'Alex',
  lastName: 'Martin',
  event: '400m',
  medalPotential: 'MP' as const,
  notes: '',
};

// what the page gets from the db
const SAVED = {
  teamSize: MOCK_TEAM_SIZE,
  disciplines: MOCK_DISCIPLINES,
  medalRows: [MEDAL_ROW],
};

describe('useTeamJourneyState', () => {
  it('starts on step 1 with the saved data', () => {
    const { result } = renderHook(() => useTeamJourneyState(SAVED));

    expect(result.current.activeStep).toBe(1);
    expect(result.current.teamSize).toEqual(MOCK_TEAM_SIZE);
    expect(result.current.disciplines).toEqual(MOCK_DISCIPLINES);
    expect(result.current.medalRows).toEqual([MEDAL_ROW]);
  });

  it('starts empty when nothing is saved yet', () => {
    const saved = {
      teamSize: INITIAL_TEAM_SIZE,
      disciplines: { rows: [], notes: '' },
      medalRows: [],
    };
    const { result } = renderHook(() => useTeamJourneyState(saved));

    expect(result.current.teamSize).toEqual(INITIAL_TEAM_SIZE);
    expect(result.current.disciplines.notes).toBe('');
    expect(result.current.medalRows).toEqual([]);
  });

  it('keeps an update to the team size', () => {
    const { result } = renderHook(() => useTeamJourneyState(SAVED));

    act(() => {
      result.current.setTeamSize({ ...MOCK_TEAM_SIZE, notes: 'new note' });
    });

    expect(result.current.teamSize.notes).toBe('new note');
  });

  it('keeps the data when the step changes', () => {
    const { result } = renderHook(() => useTeamJourneyState(SAVED));
    act(() => result.current.setMedalRows([]));

    act(() => result.current.setActiveStep(5));

    expect(result.current.activeStep).toBe(5);
    expect(result.current.medalRows).toEqual([]);
  });
});
