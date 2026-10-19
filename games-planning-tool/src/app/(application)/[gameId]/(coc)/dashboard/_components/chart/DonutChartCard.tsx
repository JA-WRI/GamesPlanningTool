// Below 50% AI generated
import DonutChart from './DonutChart';
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
      className={`flex w-44 min-w-28 shrink flex-col items-center rounded-3xl border-2 py-3 ${
        isSelected
          ? 'bg-[#EF8B64]/10 border-[#EF8B64]/90'
          : 'bg-transparent border-transparent hover:bg-[#EF8B64]/2 hover:border-[#EF8B64]/50'
      }`}
      type="button"
      aria-pressed={isSelected}
      onClick={onClick}
    >
      <div className="relative w-full [&_*:focus]:outline-none">
        <DonutChart segments={segments} />
      </div>
      <h4 className="mb-1 text-center text-sm font-bold">{title}</h4>
    </button>
  );
}
