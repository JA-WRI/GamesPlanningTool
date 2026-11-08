// AI contribution: 50% or more AI-generated
import DisciplineTable from './DisciplineTable';
import MedalPotentialTable from './MedalPotentialTable';
import PerformanceObjectivesTable from './PerformanceObjectivesTable';
import TeamSizeEstimateTable from './TeamSizeEstimateTable';
import { TeamSize } from '../lib/teamSizeLogic';
import { DisciplineBreakdown, MedalRow } from '../lib/teamSizeGridLogic';

type TeamSizeStepProps = {
  teamSize: TeamSize;
  onTeamSizeSave: (teamSize: TeamSize) => void;
  disciplines: DisciplineBreakdown;
  onDisciplinesSave: (disciplines: DisciplineBreakdown) => void;
  medalRows: MedalRow[];
  onMedalRowsSave: (rows: MedalRow[]) => void;
};

// staff stays in teamSize for the Review step, it is just not shown here
export default function TeamSizeStep(props: TeamSizeStepProps) {
  return (
    <div className="step-fade w-full space-y-3 pt-2">
      {/* side by side from 1024px (lg), stacked below; grid items stretch,
          so both cards get the same height; min-w-0 lets the tables shrink */}
      <div className="grid gap-3 lg:grid-cols-2 *:min-w-0">
        <TeamSizeEstimateTable
          teamSize={props.teamSize}
          onSave={props.onTeamSizeSave}
        />
        <DisciplineTable
          disciplines={props.disciplines}
          onSave={props.onDisciplinesSave}
        />
      </div>
      <PerformanceObjectivesTable
        teamSize={props.teamSize}
        onSave={props.onTeamSizeSave}
      />
      <MedalPotentialTable
        rows={props.medalRows}
        onSave={props.onMedalRowsSave}
      />
    </div>
  );
}
