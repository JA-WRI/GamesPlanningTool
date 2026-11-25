// AI contribution: 50% or more AI-generated
'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Alert } from '@mui/material';
import TeamSizeStep from '@/features/team-size/components/TeamSizeStep';
import TeamJourneyStepper from '@/features/team-journey/components/TeamJourneyStepper';
import StepNavButtons from '@/features/team-journey/components/StepNavButtons';
import {
  parseStep,
  stepQuery,
  type JourneyStepStatuses,
} from '@/features/team-journey/lib/stepperLogic';
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
  stepStatuses: JourneyStepStatuses;
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
  stepStatuses,
  draftKeys,
  initialDrafts,
}: TeamJourneyClientProps) {
  const searchParams = useSearchParams();
  const currentStep = parseStep(searchParams.get('step'));

  // puts the step in the url so a reload stays on it
  const goToStep = (step: number) => {
    // clicking the open step again should not add to the browser history
    if (step === currentStep) return;
    window.history.pushState(
      null,
      '',
      stepQuery(searchParams.toString(), step),
    );
  };

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
      <TeamJourneyStepper
        currentStep={currentStep}
        statuses={stepStatuses}
        onStepChange={goToStep}
      />
      {/* hidden instead of removed, so unsaved edits stay when switching steps */}
      <div hidden={currentStep !== 1}>
        {saveFailed && (
          <Alert severity="error">
            Your last change was not saved. Please try again.
          </Alert>
        )}
        <TeamSizeStep
          teamSize={teamSize}
          onTeamSizeSave={async (next) => {
            await saveToDb(next, disciplines);
            setTeamSize(next);
          }}
          disciplines={disciplines}
          onDisciplinesSave={async (next) => {
            await saveToDb(teamSize, next);
            setDisciplines(next);
          }}
          medalRows={medalRows}
          onMedalRowsSave={saveMedals}
          draftKeys={draftKeys}
          initialDrafts={initialDrafts}
        />
      </div>
      {/* the accreditation content comes in #104 and #105 */}
      {currentStep === 2 && (
        <p className="py-12 text-center text-muted">
          Accreditation is coming soon.
        </p>
      )}
      <StepNavButtons currentStep={currentStep} onStepChange={goToStep} />
    </div>
  );
}
