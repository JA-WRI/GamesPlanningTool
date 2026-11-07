// This page has been coded by both me and AI (50%).
// I started coding the general structure of the component and used AI to accelerate the process and get the right placement of elements
import DonutChart from '@/components/commons/DonutChart';
import ChartLegend from '@/components/commons/ChartLegend';
import type { ChartSegment } from '@/components/commons/chartTypes';
import DashboardPanel from './DashboardPanel';

type ProgressCounts = {
  COMPLETE: number;
  SUBMITTED: number;
  ACTION_REQUIRED: number;
  IN_PROGRESS: number;
  NOT_STARTED: number;
};

export default function PlanningProgressCard({
  counts,
}: {
  counts: ProgressCounts;
}) {
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
  const complete =
    total === 0 ? 0 : Math.round((counts.COMPLETE / total) * 100);

  const segments: ChartSegment[] = [
    {
      key: 'complete',
      label: 'Complete',
      value: counts.COMPLETE,
      color: 'var(--color-success)',
    },
    {
      key: 'submitted',
      label: 'Submitted',
      value: counts.SUBMITTED,
      color: 'var(--color-info)',
    },
    {
      key: 'required-actions',
      label: 'Required Actions',
      value: counts.ACTION_REQUIRED,
      color: 'var(--color-error)',
    },
    {
      key: 'in-progress',
      label: 'In Progress',
      value: counts.IN_PROGRESS,
      color: 'var(--color-warning)',
    },
    {
      key: 'not-started',
      label: 'Not Started',
      value: counts.NOT_STARTED,
      color: 'var(--color-muted)',
    },
  ];
  return (
    <DashboardPanel
      id="progress-heading"
      title={`Planning Progress – ${complete}% complete`}
    >
      <div className="mt-6 flex flex-col items-center justify-center gap-6 sm:flex-row sm:flex-wrap xl:flex-nowrap">
        <div className="w-full max-w-72 shrink-0">
          <div
            role="img"
            aria-label={`Planning status breakdown: ${segments
              .map((segment) => `${segment.label}: ${segment.value}`)
              .join(', ')}`}
          >
            <DonutChart segments={segments} className="h-64 w-full" />
          </div>
        </div>
        <div className="w-full max-w-64 rounded-xl border border-muted/20 bg-background p-5 shadow-sm [&_ul]:flex-col [&_ul]:items-start [&_ul]:gap-4">
          <ChartLegend
            items={segments.map((segment) => ({
              ...segment,
              label: `${segment.label} (${total ? Math.round((segment.value / total) * 100) : 0}%)`,
            }))}
          />
        </div>
      </div>
    </DashboardPanel>
  );
}
