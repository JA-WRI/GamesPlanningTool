// AI contribution: 50% or more AI-generated
'use client';

import { useState } from 'react';
import { Alert } from '@mui/material';
import TeamSizeStep from '@/features/team-size/components/TeamSizeStep';
import { saveTeamSize } from '@/features/team-size/actions/teamSizeActions';
import { saveMedalRows } from '@/features/team-size/actions/medalPotentialActions';
import type { TeamSize } from '@/features/team-size/lib/teamSizeLogic';
import type { DisciplineBreakdown } from '@/features/team-size/lib/teamSizeGridLogic';
import type {
  MedalObjectiveRow,
  MedalRow,
  TeamSizeRow,
} from '@/features/team-size/lib/teamSizeGridLogic';
import type { DisciplineGridRow } from '@/features/team-size/lib/disciplineGridLogic';
import {
  type SavedTeamJourney,
  useTeamJourneyState,
} from './useTeamJourneyState';

type TeamJourneyClientProps = {
  gameId: string;
  nsoId: string;
  saved: SavedTeamJourney;
  draftKeys: {
    estimate: string;
    disciplines: string;
    performance: string;
    medalPotential: string;
    estimateNotes: string;
    disciplineNotes: string;
  };
  initialDrafts: {
    estimate?: TeamSizeRow[];
    disciplines?: DisciplineGridRow[];
    performance?: MedalObjectiveRow[];
    medalPotential?: MedalRow[];
    estimateNotes?: string;
    disciplineNotes?: string;
  };
};

export default function TeamJourneyClient({
  gameId,
  nsoId,
  saved,
  draftKeys,
  initialDrafts,
}: TeamJourneyClientProps) {
  const {
    teamSize,
    setTeamSize,
    disciplines,
    setDisciplines,
    medalRows,
    setMedalRows,
  } = useTeamJourneyState(saved);
  const [saveFailed, setSaveFailed] = useState(false);

  // saves to the db and shows an error if it fails
  const saveToDb = async (
    nextTeamSize: TeamSize,
    nextDisciplines: DisciplineBreakdown,
  ): Promise<void> => {
    try {
      const result = await saveTeamSize(
        gameId,
        nsoId,
        nextTeamSize,
        nextDisciplines,
      );
      setSaveFailed(!result.ok);
      if (!result.ok) throw new Error('Team-size save was rejected.');
    } catch (error) {
      setSaveFailed(true);
      throw error;
    }
  };

  const saveMedals = async (nextRows: MedalRow[]): Promise<void> => {
    try {
      const result = await saveMedalRows(gameId, nsoId, nextRows);
      setSaveFailed(!result.ok);
      if (!result.ok) throw new Error('Medal save was rejected.');
      setMedalRows(nextRows);
    } catch (error) {
      setSaveFailed(true);
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-white px-10 py-8">
      {saveFailed && (
        <Alert severity="error">
          Your last change was not saved. Please try again.
        </Alert>
      )}
      <TeamSizeStep
        teamSize={teamSize}
        onTeamSizeSave={async (next) => {
          setTeamSize(next);
          await saveToDb(next, disciplines);
        }}
        disciplines={disciplines}
        onDisciplinesSave={async (next) => {
          setDisciplines(next);
          await saveToDb(teamSize, next);
        }}
        medalRows={medalRows}
        onMedalRowsSave={saveMedals}
        draftKeys={draftKeys}
        initialDrafts={initialDrafts}
      />
    </div>
  );
}
