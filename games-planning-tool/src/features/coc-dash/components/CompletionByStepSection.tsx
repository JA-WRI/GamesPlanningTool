// Below 50% AI generated
'use client';

import { BookOpen, Gauge, TriangleAlert, Users } from 'lucide-react';
import { statusToSegments, type Status } from '@/components/commons/status';
import DonutChartCard from './chart/DonutChartCard';
import StatCard from '../components/StatCard';
import { computeStats } from '@/lib/dashboard';
import { DashboardChart } from '@/lib/dashboard';

type CompletionByStepSectionProps = {
  dashboardCharts: DashboardChart[];
  selectedChart: DashboardChart | null;
  onSelectChart: (chart: DashboardChart, status?: Status) => void;
};

// Top area: the 5 donut charts and the 4 summary stat cards.
export default function CompletionByStepSection({
  dashboardCharts,
  selectedChart,
  onSelectChart,
}: CompletionByStepSectionProps) {
  const stats = computeStats(dashboardCharts);

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
  return (
    <div
      className={`min-w-0 max-w-full mt-3 w-full rounded-3xl bg-white py-4 lg:flex-1 shadow-[0_2px_10px_rgba(15,23,42,0.12)]`}
    >
      <div
        className={`flex flex-wrap ${
          selectedChart
            ? 'justify-evenly gap-2 px-4'
            : 'justify-center gap-20 px-0'
        }`}
      >
        {dashboardCharts.map((d) => (
          <DonutChartCard
            key={d.title}
            title={d.title}
            segments={statusToSegments(d.counts)}
            onClick={() => onSelectChart(d)}
            onSegmentClick={(segment) =>
              onSelectChart(d, segment.label as Status)
            }
            isSelected={selectedChart?.title === d.title}
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
