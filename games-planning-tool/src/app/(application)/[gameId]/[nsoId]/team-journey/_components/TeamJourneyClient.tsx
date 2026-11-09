// AI contribution: 50% or more AI-generated
'use client';

//import StepTabs from './StepTabs';
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

// one small function per step, with the same props as before
// const STEPS: Record<number, (state: TeamJourneyState) => React.ReactNode> = {
//   1: (state) => (
//     <TeamSizeStep
//       teamSize={state.teamSize}
//       onChange={state.setTeamSize}
//       disciplines={state.disciplines}
//       onDisciplinesChange={state.setDisciplines}
//       medalRows={state.medalRows}
//       onMedalRowsChange={state.setMedalRows}
//     />
//   ),
// };

// export default function TeamJourneyClient() {
//   const state = useTeamJourneyState();

//   return (
//     <div className="min-h-screen bg-white">
//       <StepTabs
//         activeStep={state.activeStep}
//         onStepChange={state.setActiveStep}
//       />

//       <div className="px-10 py-8">{STEPS[state.activeStep]?.(state)}</div>
//     </div>
//   );
// }
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
