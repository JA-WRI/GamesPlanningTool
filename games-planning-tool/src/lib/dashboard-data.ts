// AI contribution: Above 50% AI generated
import type { Status, StatusCounts } from '@/components/commons/status';
import type { Team, DashboardChart } from '@/lib/dashboard';
import { TaskStatus } from '@/generated/prisma/enums';

// Db enum mapping to frontend status strings
const statusMap = {
  [TaskStatus.NOT_STARTED]: 'Not Started',
  [TaskStatus.IN_PROGRESS]: 'In Progress',
  [TaskStatus.COMPLETE]: 'Complete',
  [TaskStatus.SUBMITTED]: 'Submitted',
  [TaskStatus.ACTION_REQUIRED]: 'Action Required',
} as const satisfies Record<TaskStatus, Status>;

const STEPS = [
  { title: 'Contact Info', field: 'contactInfo' },
  { title: 'Team Size', field: 'teamSize' },
  { title: 'Accreditation', field: 'accreditation' },
  { title: 'Estimated Costs', field: 'estimatedCosts' },
  { title: 'Review and Completion', field: 'reviewAndCompletion' },
] as const;

type GameNsoRecord = {
  id: string;
  nso: {
    name: string;
  };
  progressTracking: {
    contactInfo: TaskStatus;
    teamSize: TaskStatus;
    accreditation: TaskStatus;
    estimatedCosts: TaskStatus;
    reviewAndCompletion: TaskStatus;
  } | null;
};

// Return logo path by parsing NSO name, e.g. "Badminton Canada" -> "Badminton_Canada_logo.png"
function getLogoPath(nsoName: string): string {
  return `/logos/${nsoName.replace(/\s+/g, '_')}_logo.png`;
}

export function transformDashboardData(records: GameNsoRecord[]) {
  const teams: Team[] = records.map((record) => {
    const progress = record.progressTracking;

    return {
      name: record.nso.name,
      logo: getLogoPath(record.nso.name),
      columns: STEPS.map((step) => ({
        stepKey: step.field,
        title: step.title,
        href: '#',
        status: statusMap[progress?.[step.field] ?? TaskStatus.NOT_STARTED],
      })),
    };
  });

  const dashboardData: DashboardChart[] = STEPS.map((step) => {
    const counts: StatusCounts = {
      'Not Started': 0,
      'In Progress': 0,
      Complete: 0,
      Submitted: 0,
      'Action Required': 0,
    };

    records.forEach((record) => {
      counts[
        statusMap[
          record.progressTracking?.[step.field] ?? TaskStatus.NOT_STARTED
        ]
      ]++;
    });

    return {
      stepKey: step.field,
      title: step.title,
      counts,
    };
  });

  return { teams, dashboardData };
}
