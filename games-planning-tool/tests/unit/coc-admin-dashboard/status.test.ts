//50% or more AI-generated
import { describe, it, expect } from 'vitest';
import {
  STATUS_ORDER,
  statusColor,
  statusLegendItems,
  statusToSegments,
  type StatusCounts,
} from '../../../src/components/commons/status';
import { tagHex } from '../../../src/components/commons/Tag';

const counts: StatusCounts = {
  'Not Started': 1,
  'In Progress': 2,
  Completed: 3,
  Submitted: 4,
  'Requires Update': 5,
};

describe('status helpers', () => {
  it('orders statuses consistently', () => {
    expect(STATUS_ORDER).toEqual([
      'Not Started',
      'In Progress',
      'Completed',
      'Submitted',
      'Requires Update',
    ]);
  });

  it('maps every status to a tag colour', () => {
    STATUS_ORDER.forEach((status) => {
      expect(statusColor[status]).toBeDefined();
    });
  });

  describe('statusToSegments', () => {
    it('produces one segment per status in STATUS_ORDER', () => {
      const segments = statusToSegments(counts);

      expect(segments.map((s) => s.key)).toEqual(STATUS_ORDER);
    });

    it('carries over each status count and colour', () => {
      const segments = statusToSegments(counts);

      segments.forEach((segment, i) => {
        const status = STATUS_ORDER[i];
        expect(segment.value).toBe(counts[status]);
        expect(segment.color).toBe(tagHex[statusColor[status]]);
        expect(segment.label).toBe(status);
      });
    });
  });

  it('builds legend items covering every status with matching colours', () => {
    expect(statusLegendItems).toHaveLength(STATUS_ORDER.length);
    statusLegendItems.forEach((item, i) => {
      const status = STATUS_ORDER[i];
      expect(item.label).toBe(status);
      expect(item.color).toBe(tagHex[statusColor[status]]);
    });
  });
});
