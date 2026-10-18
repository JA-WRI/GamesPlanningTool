// This page has been coded by both me and AI (50%).
// I started coding the general structure of the component and used AI to accelerate the process and get the right placement of elements
import DonutChart from '../coc-admin-dashboard/chart/donutChart';
import ChartLegend from '../coc-admin-dashboard/chart/chartLegend';
import type { ChartSegment } from '../coc-admin-dashboard/chart/types';
import DashboardPanel from './DashboardPanel';

//Mock data for the moment
const segments: ChartSegment[] = [
  { key: 'complete', label: 'Complete', value: 68, color: 'var(--color-success)' },
  { key: 'submitted', label: 'Submitted', value: 10, color: 'var(--color-info)' },
  { key: 'required-actions', label: 'Required Actions', value: 7, color: 'var(--color-error)' },
  { key: 'in-progress', label: 'In Progress', value: 5, color: 'var(--color-warning)' },
  { key: 'not-started', label: 'Not Started', value: 10, color: 'var(--color-muted)' },
];

export default function PlanningProgressCard() {
  const complete = segments.find((segment) => segment.key === 'complete')?.value ?? 0;

  return (
    <DashboardPanel id="progress-heading" title={`Planning Progress – ${complete}% complete`}>
      <div className="mt-6 flex flex-col items-center justify-center gap-6 sm:flex-row sm:flex-wrap xl:flex-nowrap">
        <div className="w-full max-w-72 shrink-0">
          <div
            role="img"
            aria-label={`Planning status breakdown: ${segments.map((segment) => `${segment.label} ${segment.value}%`).join(', ')}`}
          >
            <DonutChart segments={segments} className="h-64 w-full" />
          </div>
        </div>
        <div className="w-full max-w-64 rounded-xl border border-muted/20 bg-background p-5 shadow-sm [&_ul]:flex-col [&_ul]:items-start [&_ul]:gap-4">
          <ChartLegend
            items={segments.map((segment) => ({
              ...segment,
              label: `${segment.label} (${segment.value}%)`,
            }))}
          />
        </div>
      </div>
    </DashboardPanel>
  );
}
