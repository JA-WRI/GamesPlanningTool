//50% or more AI-generated
import type { Status, StatusCounts } from '@/components/commons/status';
import { STATUS_ORDER } from '@/components/commons/status';

export type DashboardStats = {
  total: number;
  avgCompletion: number;
  toReview: number;
  toStart: number;
};

export function percentage(part: number, whole: number): number {
  return whole === 0 ? 0 : Math.round((part / whole) * 100);
}

export function totalOf(counts: StatusCounts): number {
  return Object.values(counts).reduce((sum, n) => sum + n, 0);
}

// Every step tracks the same NSOs, so the first step gives the NSO total.
// Percentages are computed over all step counts combined.
export function computeStats(
  steps: { counts: StatusCounts }[],
): DashboardStats {
  const all = steps.reduce((sum, s) => sum + totalOf(s.counts), 0);
  const sumOf = (status: Status) =>
    steps.reduce((sum, s) => sum + s.counts[status], 0);

  return {
    total: steps.length > 0 ? totalOf(steps[0].counts) : 0,
    avgCompletion: percentage(sumOf('Completed'), all),
    toReview: percentage(sumOf('Submitted'), all),
    toStart: percentage(sumOf('Not Started'), all),
  };
}

type TeamLike = { 
  name: string; 
  altNames?: string[]; 
  columns: { title: string, status: Status }[] 
};

// A team matches when its name contains the search text and, if any statuses
// are selected, at least one of its steps has one of those statuses.
export function filterTeams<T extends TeamLike>(
  teams: T[],
  search: string,
  statuses: Status[],
): T[] {
  const query = search.trim().toLowerCase();
  return teams.filter(
    (team) =>
    (team.name.toLowerCase().includes(query) || team.altNames?.some((name) => name.toLowerCase().includes(query))) &&
      (statuses.length === 0 ||
        team.columns.some((col) => statuses.includes(col.status))),
  );
}

// Wraps around at both ends so the pager can cycle forever.
export function cycleIndex(index: number, delta: number, length: number) {
  return (((index + delta) % length) + length) % length;
}

// Teams grouped by name, bucketed by their status at a given column index,
// in STATUS_ORDER.
export function namesByStatusAtColumn<T extends TeamLike>(
  teams: T[],
  columnIndex: number,
): Record<Status, string[]> {
  return Object.fromEntries(
    STATUS_ORDER.map((status) => [
      status,
      teams
        .filter((team) => team.columns[columnIndex]?.status === status)
        .map((team) => team.name),
    ]),
  ) as Record<Status, string[]>;
}

type TeamWithTitledColumns = {
  columns: { title: string; status: Status }[];
};

// Keeps only teams where every active column filter matches one of their
// columns' statuses.
export function filterByColumnStatuses<T extends TeamWithTitledColumns>(
  teams: T[],
  columnFilters: Record<string, Status[]>,
): T[] {
  return teams.filter((team) =>
    Object.entries(columnFilters).every(([columnTitle, statuses]) => {
      if (statuses.length === 0) return true;
      const column = team.columns.find((col) => col.title === columnTitle);
      return column !== undefined && statuses.includes(column.status);
    }),
  );
}
