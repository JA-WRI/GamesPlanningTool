//100% AI
import type { ChartSegment } from './types';

type ChartLegendProps = {
  items: Pick<ChartSegment, 'key' | 'label' | 'color'>[];
};

export default function ChartLegend({ items }: ChartLegendProps) {
  return (
    <ul className="flex flex-wrap items-center gap-4 text-xs">
      {items.map((item) => (
        <li key={item.key} className="flex items-center gap-1.5">
          <span
            className="inline-block h-2.5 w-2.5 rounded-sm"
            style={{ backgroundColor: item.color }}
          />
          {item.label}
        </li>
      ))}
    </ul>
  );
}
