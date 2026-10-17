// Below 50% AI generated
'use client';

import { BookOpen, Gauge, TriangleAlert, Users } from 'lucide-react';
import { statusToSegments } from '@/components/commons/status';
import DonutChartCard from './chart/donutChartCard';
import StatCard from './StatCard';
import { mockDashboard } from '@/lib/mock-data-chart';
import { computeStats, percentage, totalOf } from '@/lib/dashboard';

// mockDashboard is static, so the overall stats never change between renders
const stats = computeStats(mockDashboard);

// The 4 summary stat cards shown under the donut charts.
const statCards = [
  {
    icon: Users,
    label: 'Total',
    value: stats.total,
    description: 'NSOs tracked',
  },
  {
    icon: Gauge,
    label: 'Avg',
    value: `${stats.avgCompletion}%`,
    description: 'Average completion',
  },
  {
    icon: BookOpen,
    label: 'To review',
    value: `${stats.toReview}%`,
    description: 'Awaiting review',
  },
  {
    icon: TriangleAlert,
    label: 'To start',
    value: `${stats.toStart}%`,
    description: 'Not started',
  },
];

// Top area: the 5 donut charts and the 4 summary stat cards.
export default function CompletionByStepSection({
  selectedChart,
  onSelectChart,
}: {
  selectedChart: (typeof mockDashboard)[number] | null;
  onSelectChart: (chart: (typeof mockDashboard)[number]) => void;
}) {
  return (
    <div className="min-w-0 max-w-full mt-3 w-full rounded-3xl bg-[#F8F8F8] py-4 shadow-[0_8px_30px_rgba(0,0,0,0.14)] lg:flex-1">
      <div
        className={`flex flex-wrap ${
          selectedChart
            ? 'justify-evenly gap-2 px-4'
            : 'justify-center gap-20 px-0'
        }`}
      >
        {mockDashboard.map((d) => (
          <DonutChartCard
            key={d.title}
            title={d.title}
            segments={statusToSegments(d.counts)}
            onClick={() => onSelectChart(d)}
            isSelected={selectedChart?.title === d.title}
            completedPercent={percentage(d.counts.Completed, totalOf(d.counts))}
          />
        ))}
      </div>
      <div className="mt-2 grid grid-cols-2 gap-3 px-6 md:grid-cols-4">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>
    </div>
  );
}
