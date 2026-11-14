// AI contribution: 50% or more AI-generated
import DisciplineTable from './DisciplineTable';
import MedalPotentialTable from './MedalPotentialTable';
import PerformanceObjectivesTable from './PerformanceObjectivesTable';
import TeamSizeEstimateTable from './TeamSizeEstimateTable';
import type { TeamSize } from '../lib/teamSizeLogic';
import type {
  DisciplineBreakdown,
  MedalObjectiveRow,
  MedalRow,
  TeamSizeRow,
} from '../lib/teamSizeGridLogic';
import type { DisciplineGridRow as DisciplineGridRowType } from '../lib/disciplineGridLogic';

type TeamSizeStepProps = {
  teamSize: TeamSize;
  onTeamSizeSave: (teamSize: TeamSize) => void | Promise<unknown>;
  disciplines: DisciplineBreakdown;
  onDisciplinesSave: (
    disciplines: DisciplineBreakdown,
  ) => void | Promise<unknown>;
  medalRows: MedalRow[];
  onMedalRowsSave: (rows: MedalRow[]) => void;
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
    disciplines?: DisciplineGridRowType[];
    performance?: MedalObjectiveRow[];
    medalPotential?: MedalRow[];
    estimateNotes?: string;
    disciplineNotes?: string;
  };
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
          initialDraft={props.initialDrafts.estimate}
          draftKey={props.draftKeys.estimate}
          initialDraftNotes={props.initialDrafts.estimateNotes}
          draftNotesKey={props.draftKeys.estimateNotes}
          onSave={props.onTeamSizeSave}
        />
        <DisciplineTable
          disciplines={props.disciplines}
          initialDraft={props.initialDrafts.disciplines}
          draftKey={props.draftKeys.disciplines}
          initialDraftNotes={props.initialDrafts.disciplineNotes}
          draftNotesKey={props.draftKeys.disciplineNotes}
          onSave={props.onDisciplinesSave}
        />
      </div>
      <PerformanceObjectivesTable
        teamSize={props.teamSize}
        initialDraft={props.initialDrafts.performance}
        draftKey={props.draftKeys.performance}
        onSave={props.onTeamSizeSave}
      />
      <MedalPotentialTable
        rows={props.medalRows}
        initialDraft={props.initialDrafts.medalPotential}
        draftKey={props.draftKeys.medalPotential}
        onSave={props.onMedalRowsSave}
      />
    </div>
  );
}
