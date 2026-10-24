// AI contribution: 50% or more AI-generated
'use client';

//import StepTabs from './StepTabs';
import TeamSizeStep from '@/features/team-size/components/TeamSizeStep';
import { TeamJourneyState, useTeamJourneyState } from './useTeamJourneyState';

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
export default function TeamJourneyClient() {
  const {
    teamSize,
    setTeamSize,
    disciplines,
    setDisciplines,
    medalRows,
    setMedalRows,
  } = useTeamJourneyState();

  return (
    <div className="min-h-screen bg-white px-10 py-8">
      <TeamSizeStep
        teamSize={teamSize}
        onChange={setTeamSize}
        disciplines={disciplines}
        onDisciplinesChange={setDisciplines}
        medalRows={medalRows}
        onMedalRowsChange={setMedalRows}
      />
    </div>
  );
}
