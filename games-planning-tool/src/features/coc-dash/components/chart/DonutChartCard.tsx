// Below 50% AI generated
import DonutChart from '@/components/commons/DonutChart';
import type { ChartSegment } from '@/components/commons/chartTypes';

type DonutChartCardProps = {
  title: string;
  segments: ChartSegment[];
  onClick: () => void;
  onSegmentClick?: (segment: ChartSegment, index: number) => void;
  isSelected: boolean;
};

export default function DonutChartCard({
  title,
  segments,
  onClick,
  onSegmentClick,
  isSelected,
}: DonutChartCardProps) {
  return (
    <button
      className={`flex w-44 min-w-28 shrink cursor-pointer flex-col items-center rounded-3xl border-2 py-3 ${
        isSelected
          ? 'bg-[#EF8B64]/10 border-[#EF8B64]/90'
          : 'bg-transparent border-transparent hover:bg-[#EF8B64]/2 hover:border-[#EF8B64]/50'
      }`}
      type="button"
      aria-pressed={isSelected}
      onClick={onClick}
    >
      <span className="relative w-full [&_*:focus]:outline-none">
        <DonutChart
          segments={segments}
          className="mb-6 h-36 w-full"
          onSegmentClick={onSegmentClick}
        />
      </span>
      <span className="mb-1 text-center text-sm font-bold">{title}</span>
    </button>
  );
}
