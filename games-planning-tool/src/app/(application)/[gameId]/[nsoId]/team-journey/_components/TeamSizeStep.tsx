// AI contribution: 50% or more AI-generated
import DisciplineTable from './DisciplineTable';
import MedalPotentialTable from './MedalPotentialTable';
import PerformanceObjectives from './PerformanceObjectives';
import { SectionTitle } from './TeamSizeCard';
import TeamSizeTable from './TeamSizeTable';
import { TeamSize } from '../_lib/teamSizeLogic';
import { DisciplineBreakdown, MedalRow } from '../_lib/teamSizeGridLogic';

type TeamSizeStepProps = {
  teamSize: TeamSize;
  onChange: (teamSize: TeamSize) => void;
  disciplines: DisciplineBreakdown;
  onDisciplinesChange: (disciplines: DisciplineBreakdown) => void;
  medalRows: MedalRow[];
  onMedalRowsChange: (rows: MedalRow[]) => void;
};

// staff stays in teamSize for the Review step, it is just not shown here
export default function TeamSizeStep(props: TeamSizeStepProps) {
  return (
    <div className="step-fade w-full space-y-3 pt-2">
      <SectionTitle>Estimated team size</SectionTitle>
      <TeamSizeTable teamSize={props.teamSize} onChange={props.onChange} />
      <DisciplineTable
        disciplines={props.disciplines}
        onChange={props.onDisciplinesChange}
      />

      <div className="pt-2">
        <SectionTitle>Performance objectives & medal potential</SectionTitle>
      </div>
      <PerformanceObjectives
        teamSize={props.teamSize}
        onChange={props.onChange}
      />
      <MedalPotentialTable
        rows={props.medalRows}
        onChange={props.onMedalRowsChange}
      />
    </div>
  );
}
