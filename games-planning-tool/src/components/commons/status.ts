//50% or more AI-generated
import type { ChartSegment } from './chartTypes';
import type { TagColor } from './Tag';
import { tagHex } from './Tag';

export type Status =
  'Submitted' | 'In Progress' | 'Complete' | 'Not Started' | 'Action Required';

export const statusColor: Record<Status, TagColor> = {
  Submitted: 'blue',
  'In Progress': 'yellow',
  Complete: 'green',
  'Not Started': 'gray',
  'Action Required': 'red',
};

export const STATUS_ORDER: Status[] = [
  'Not Started',
  'In Progress',
  'Complete',
  'Submitted',
  'Action Required',
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
