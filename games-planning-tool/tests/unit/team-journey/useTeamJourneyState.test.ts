// AI contribution:Below 50% AI-generated
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTeamJourneyState } from '@/app/(application)/[gameId]/[nsoId]/team-journey/_components/useTeamJourneyState';
import {
  INITIAL_TEAM_SIZE,
  MOCK_DISCIPLINES,
  MOCK_MEDAL_ROWS,
  MOCK_TEAM_SIZE,
} from '@/features/team-size/lib/mockData';

describe('useTeamJourneyState', () => {
  it('starts on step 1 with the mock team size data', () => {
    const { result } = renderHook(() => useTeamJourneyState());

    expect(result.current.activeStep).toBe(1);
    expect(result.current.teamSize).toEqual(MOCK_TEAM_SIZE);
    expect(result.current.disciplines).toEqual(MOCK_DISCIPLINES);
    expect(result.current.medalRows).toEqual(MOCK_MEDAL_ROWS);
  });

  it('starts with the saved data from the db when there is some', () => {
    const saved = {
      teamSize: INITIAL_TEAM_SIZE,
      disciplines: { rows: [], notes: 'saved note' },
    };
    const { result } = renderHook(() => useTeamJourneyState(saved));

    expect(result.current.teamSize).toEqual(INITIAL_TEAM_SIZE);
    expect(result.current.disciplines.notes).toBe('saved note');
  });

  it('keeps an update to the team size', () => {
    const { result } = renderHook(() => useTeamJourneyState());

    act(() => {
      result.current.setTeamSize({ ...MOCK_TEAM_SIZE, notes: 'new note' });
    });

    expect(result.current.teamSize.notes).toBe('new note');
  });

  it('keeps the data when the step changes', () => {
    const { result } = renderHook(() => useTeamJourneyState());
    act(() => result.current.setMedalRows([]));

    act(() => result.current.setActiveStep(5));

    expect(result.current.activeStep).toBe(5);
    expect(result.current.medalRows).toEqual([]);
  });
});
