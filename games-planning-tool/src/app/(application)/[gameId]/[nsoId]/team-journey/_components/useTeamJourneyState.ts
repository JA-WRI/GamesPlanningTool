// AI contribution: Below 50% AI-generated
'use client';

import { useState } from 'react';
import { TeamSize } from '../../../../../../features/team-size/lib/teamSizeLogic';
import {
  DisciplineBreakdown,
  MedalRow,
} from '../../../../../../features/team-size/lib/teamSizeGridLogic';
import type { SavedTeamSize } from '../../../../../../features/team-size/lib/teamSizeDbMapping';

// what the page loads from the db
export type SavedTeamJourney = SavedTeamSize & { medalRows: MedalRow[] };

// all the team journey data, kept here so nothing is lost when switching steps
export function useTeamJourneyState(saved: SavedTeamJourney) {
  const [teamSize, setTeamSize] = useState<TeamSize>(saved.teamSize);
  const [disciplines, setDisciplines] = useState<DisciplineBreakdown>(
    saved.disciplines,
  );
  const [medalRows, setMedalRows] = useState<MedalRow[]>(saved.medalRows);

  return {
    teamSize,
    setTeamSize,
    disciplines,
    setDisciplines,
    medalRows,
    setMedalRows,
  };
}

export type TeamJourneyState = ReturnType<typeof useTeamJourneyState>;
