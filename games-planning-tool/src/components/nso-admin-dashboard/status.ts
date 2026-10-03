//AI usage -> 100%
import type { TagColor } from './tag';

export type Status =
  'Submitted' | 'In Progress' | 'Completed' | 'Not Started' | 'Requires Update';

export const statusColor: Record<Status, TagColor> = {
  Submitted: 'blue',
  'In Progress': 'yellow',
  Completed: 'green',
  'Not Started': 'gray',
  'Requires Update': 'red',
};
