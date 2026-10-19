// AI usage -> 100%
import type { Status, StatusCounts } from '@/components/commons/status';

export const mockDashboard: { title: string; counts: StatusCounts }[] = [
  {
    title: 'Contact Info',
    counts: {
      'Not Started': 14,
      'In Progress': 10,
      Completed: 6,
      Submitted: 5,
      'Requires Update': 3,
    },
  },
  {
    title: 'Team Size',
    counts: {
      'Not Started': 8,
      'In Progress': 12,
      Completed: 9,
      Submitted: 5,
      'Requires Update': 4,
    },
  },
  {
    title: 'Accreditation',
    counts: {
      'Not Started': 10,
      'In Progress': 8,
      Completed: 12,
      Submitted: 4,
      'Requires Update': 4,
    },
  },
  {
    title: 'Estimated Costs',
    counts: {
      'Not Started': 15,
      'In Progress': 9,
      Completed: 7,
      Submitted: 4,
      'Requires Update': 3,
    },
  },
  {
    title: 'Review and Completion',
    counts: {
      'Not Started': 20,
      'In Progress': 8,
      Completed: 5,
      Submitted: 3,
      'Requires Update': 2,
    },
  },
];

export type Column = {
  title: string;
  status: Status;
  href: string;
};

export type Team = {
  name: string;
  logo?: string;
  columns: Column[];
};

// Every team tracks the same five steps in the same order; defining the
// titles/hrefs once here avoids repeating them for every team below.
const STEPS: { title: string; href: string }[] = [
  { title: 'Contact Info', href: '#' },
  { title: 'Team Size', href: '#' },
  { title: 'Accreditation', href: '#' },
  { title: 'Estimated Costs', href: '#' },
  { title: 'Review and Completion', href: '#' },
];

type TeamSeed = {
  name: string;
  altNames: string[],
  logo?: string;
  // One status per step, in the same order as STEPS.
  statuses: Status[];
};

const teamSeeds: TeamSeed[] = [
  {
    name: 'Badminton Canada',
    altNames: [''],
    logo: '/Badminton_Canada_logo.png',
    statuses: [
      'Requires Update',
      'Submitted',
      'Completed',
      'In Progress',
      'Not Started',
    ],
  },
  {
    // Logo is not transparent it doesn't look good on gray background -- either find transparent logo or remove background
    name: 'Basketball Canada',
    altNames: [''],
    logo: '/Basketball_Canada_logo.png',
    statuses: [
      'Not Started',
      'Submitted',
      'Not Started',
      'Not Started',
      'Not Started',
    ],
  },
  {
    name: 'Archery Canada',
    altNames: ['Tir à l\'Arc Canada'],
    logo: '/Archery_Canada_logo.png',
    statuses: [
      'Not Started',
      'Not Started',
      'Not Started',
      'Not Started',
      'Not Started',
    ],
  },
  // More placeholder teams (no logo yet) so the panel has names to list
  {
    name: 'Swimming Canada',
    altNames: ['Natation Canada'],
    statuses: [
      'Requires Update',
      'Completed',
      'In Progress',
      'Not Started',
      'Not Started',
    ],
  },
  {
    name: 'Cycling Canada',
    altNames: ['Cyclisme Canada'],
    statuses: [
      'Completed',
      'Completed',
      'Submitted',
      'Not Started',
      'Not Started',
    ],
  },
  {
    name: 'Rowing Canada Aviron',
    altNames: [''],
    statuses: [
      'Not Started',
      'Requires Update',
      'Requires Update',
      'Not Started',
      'In Progress',
    ],
  },
  {
    name: 'Soccer Canada',
    altNames: [''],
    statuses: [
      'In Progress',
      'Completed',
      'Completed',
      'In Progress',
      'Not Started',
    ],
  },
];

export const teams: Team[] = teamSeeds.map((seed) => ({
  name: seed.name,
  logo: seed.logo,
  columns: STEPS.map((step, i) => ({ ...step, status: seed.statuses[i] })),
}));
