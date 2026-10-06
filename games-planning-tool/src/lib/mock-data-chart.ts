// AI usage -> 100%
import type { StatusCounts } from '@/components/commons/status';

export const mockDashboard: { title: string; counts: StatusCounts }[] = [
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
    title: 'Arrival/Travel In',
    counts: {
      'Not Started': 14,
      'In Progress': 10,
      Completed: 6,
      Submitted: 5,
      'Requires Update': 3,
    },
  },
  {
    title: 'Departure/Travel Out',
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
