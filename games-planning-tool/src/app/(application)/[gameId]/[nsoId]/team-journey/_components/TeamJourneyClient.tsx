// AI contribution: 50% or more AI-generated
'use client';

import { useState } from 'react';
import { Alert } from '@mui/material';
import TeamSizeStep from '@/features/team-size/components/TeamSizeStep';
import { saveTeamSize } from '@/features/team-size/actions/teamSizeActions';
import { saveMedalRows } from '@/features/team-size/actions/medalPotentialActions';
import type { TeamSize } from '@/features/team-size/lib/teamSizeLogic';
import type {
  DisciplineBreakdown,
  MedalRow,
} from '@/features/team-size/lib/teamSizeGridLogic';
import { SavedTeamJourney, useTeamJourneyState } from './useTeamJourneyState';

type TeamJourneyClientProps = {
  gameId: string;
  nsoId: string;
  saved: SavedTeamJourney;
};

export default function TeamJourneyClient({
  gameId,
  nsoId,
  saved,
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

  // shows an error if a save fails
  const showSaveResult = (save: Promise<{ ok: boolean }>) => {
    save
      .then((result) => setSaveFailed(!result.ok))
      .catch(() => setSaveFailed(true));
  };

  const saveToDb = (
    nextTeamSize: TeamSize,
    nextDisciplines: DisciplineBreakdown,
  ) => {
    showSaveResult(saveTeamSize(gameId, nsoId, nextTeamSize, nextDisciplines));
  };

  const saveMedals = (nextRows: MedalRow[]) => {
    setMedalRows(nextRows);
    showSaveResult(saveMedalRows(gameId, nsoId, nextRows));
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
        onTeamSizeSave={(next) => {
          setTeamSize(next);
          saveToDb(next, disciplines);
        }}
        disciplines={disciplines}
        onDisciplinesSave={(next) => {
          setDisciplines(next);
          saveToDb(teamSize, next);
        }}
        medalRows={medalRows}
        onMedalRowsSave={saveMedals}
      />
    </div>
  );
}
