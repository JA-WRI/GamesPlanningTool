// Above 50% AI generated
import type { Status, StatusCounts } from '@/components/commons/status';
import type { Column, Team } from '@/lib/dashboard';

// Db enum mapping to frontend status strings
const statusMap = {
    not_started: 'Not Started',
    in_progress: 'In Progress',
    completed: 'Completed',
    submitted: 'Submitted',
    requires_update: 'Requires Update',
} as const satisfies Record<string, Status>;

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
        contactInfo: keyof typeof statusMap;
        teamSize: keyof typeof statusMap;
        accreditation: keyof typeof statusMap;
        estimatedCosts: keyof typeof statusMap;
        reviewAndCompletion: keyof typeof statusMap;
    } | null;
}

export function transformDashboardData(records: GameNsoRecord[]) {
    const teams: Team[] = records.map((record) => {
        const progress = record.progressTracking;

        return {
            name: record.nso.name,
            columns: STEPS.map((step) => ({
                title: step.title,
                href: '#',
                status: statusMap[progress?.[step.field] ?? 'not_started'],
            })),
        };
    });

    const dashboardData = STEPS.map((step, index) => {
        const counts: StatusCounts = {
            'Not Started': 0,
            'In Progress': 0,
            'Completed': 0,
            'Submitted': 0,
            'Requires Update': 0,
        };

        teams.forEach((team) => {
            counts[team.columns[index].status]++;
        });

        return {
            title: step.title,
            counts,
        };
    });

    return { teams, dashboardData };
}