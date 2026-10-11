// Below 50% AI generated
import DonutChart from './donutChart';
import type { ChartSegment } from './types';

type DonutChartCardProps = {
  title: string;
  segments: ChartSegment[];
  onClick: () => void;
  isSelected: boolean;
};

export default function DonutChartCard({
  title,
  segments,
  onClick,
  isSelected = false,
}: DonutChartCardProps) {
  return (
    <button
      className={`flex w-44 flex-col items-center ${
        isSelected
          ? 'bg-[#EF8B64]/10 border-2 border-[#EF8B64]/80 rounded-3xl'
          : 'bg-transparent border-2 border-transparent rounded-3xl hover:bg-[#EF8B64]/2 hover:border-2 hover:border-[#EF8B64]/50'
      }`}
      type="button"
      onClick={onClick}
    >
      <DonutChart segments={segments} />
      <h4 className="mb-1 text-center text-sm font-bold">{title}</h4>
    </button>
  );
}
