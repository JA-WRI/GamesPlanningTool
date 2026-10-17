// AI contribution: 50% or more AI-generated
'use client';

import StepTabs from './StepTabs';
import TeamSizeStep from './TeamSize/TeamSizeStep';
import AccreditationStep from './AccreditationStep';
import ArrivalStep from './ArrivalStep';
import DepartureStep from './DepartureStep';
import ReviewStep from './ReviewStep';
import { TeamJourneyState, useTeamJourneyState } from './useTeamJourneyState';

// one small function per step, with the same props as before
const STEPS: Record<number, (state: TeamJourneyState) => React.ReactNode> = {
  1: (state) => (
    <TeamSizeStep
      teamSize={state.teamSize}
      onChange={state.setTeamSize}
      disciplines={state.disciplines}
      onDisciplinesChange={state.setDisciplines}
      medalRows={state.medalRows}
      onMedalRowsChange={state.setMedalRows}
    />
  ),
  2: (state) => (
    <AccreditationStep
      rows={state.accreditations}
      onChange={state.setAccreditations}
      finishedDateBoxes={state.accreditationFinishedDateBoxes}
      onFinishedDateBoxesChange={state.setAccreditationFinishedDateBoxes}
    />
  ),
  3: (state) => (
    <ArrivalStep
      rows={state.arrivals}
      onChange={state.setArrivals}
      finishedDateBoxes={state.arrivalFinishedDateBoxes}
      onFinishedDateBoxesChange={state.setArrivalFinishedDateBoxes}
    />
  ),
  4: (state) => (
    <DepartureStep
      rows={state.departures}
      onChange={state.setDepartures}
      finishedDateBoxes={state.departureFinishedDateBoxes}
      onFinishedDateBoxesChange={state.setDepartureFinishedDateBoxes}
    />
  ),
  5: (state) => (
    <ReviewStep
      teamSize={state.teamSize}
      accreditations={state.accreditations}
      arrivals={state.arrivals}
      departures={state.departures}
    />
  ),
};

export default function TeamJourneyClient() {
  const state = useTeamJourneyState();

  return (
    <div className="min-h-screen bg-white">
      <StepTabs
        activeStep={state.activeStep}
        onStepChange={state.setActiveStep}
      />

      <div className="px-10 py-8">{STEPS[state.activeStep]?.(state)}</div>
    </div>
  );
}
