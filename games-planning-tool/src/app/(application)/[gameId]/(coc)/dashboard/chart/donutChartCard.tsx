import DonutChart from './donutChart';
import type { ChartSegment } from './types';

type DonutChartCardProps = {
  title: string;
  segments: ChartSegment[];
};

export default function DonutChartCard({
  title,
  segments,
}: DonutChartCardProps) {
  return (
    <div className="flex w-44 flex-col items-center">
      <h4 className="mb-1 text-center text-sm font-bold">{title}</h4>
      <DonutChart segments={segments} />
    </div>
  );
}
