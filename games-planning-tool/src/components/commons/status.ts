//AI usage -> 100%
import type { ChartSegment } from '../coc/dashboard/chart/types';
import type { TagColor } from './tag';
import { tagHex } from './tag';

export type Status =
  'Submitted' | 'In Progress' | 'Completed' | 'Not Started' | 'Requires Update';

export const statusColor: Record<Status, TagColor> = {
  'Submitted': 'blue',
  'In Progress': 'yellow',
  'Completed': 'green',
  'Not Started': 'gray',
  'Requires Update': 'red',
};

export const STATUS_ORDER: Status[] = [
  'Not Started',
  'In Progress',
  'Completed',
  'Submitted',
  'Requires Update',
];

export type StatusCounts = Record<Status, number>;

export function statusToSegments(counts: StatusCounts): ChartSegment[] {
  return STATUS_ORDER.map((status) => ({
    key: status,
    label: status,
    value: counts[status],
    color: tagHex[statusColor[status]],
  }));
}

export const statusLegendItems = STATUS_ORDER.map((status) => ({
  key: status,
  label: status,
  color: tagHex[statusColor[status]],
}));
