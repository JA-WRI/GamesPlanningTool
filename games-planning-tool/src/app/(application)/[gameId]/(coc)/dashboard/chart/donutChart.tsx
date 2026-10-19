// Below 50% AI generated
// Original file was not AI generated, but it has been modified by AI to some extent to fit desired aesthetic.
'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import type { ChartSegment } from './types';

type DonutChartProps = {
  segments: ChartSegment[];
  className?: string;
};

type TooltipState = {
  percentage: number;
  x: number;
  y: number;
  color: string;
} | null;

// Fast cursor movement can jump straight from a sector to outside the chart
// without ever firing that sector's onMouseLeave, which left the percentage
// bubble stuck on screen. Watching every pointer move and hiding the bubble
// once the cursor is actually outside the chart's bounds catches that case
// regardless of which element fired (or missed) its own leave event.
function useHideTooltipOnPointerLeave(
  containerRef: RefObject<HTMLDivElement | null>,
  tooltip: TooltipState,
  setTooltip: (tooltip: TooltipState) => void,
) {
  useEffect(() => {
    if (!tooltip) return;

    function handlePointerMove(event: PointerEvent) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const inside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;

      if (!inside) setTooltip(null);
    }

    document.addEventListener('pointermove', handlePointerMove);
    return () => document.removeEventListener('pointermove', handlePointerMove);
  }, [tooltip, containerRef, setTooltip]);
}

// Position of the bubble (just outside the hovered sector) and the
// percentage it should display.
function hoverTooltipFor(
  sector: { cx: number; cy: number; midAngle: number; outerRadius: number },
  value: number,
  total: number,
  color: string,
): TooltipState {
  const angle = (sector.midAngle * Math.PI) / 180;
  const offset = 0.5;
  const radius = sector.outerRadius + offset;

  return {
    percentage: (value / total) * 100,
    x: sector.cx + radius * Math.cos(angle),
    y: sector.cy - radius * Math.sin(angle),
    color,
  };
}

function TooltipBubble({ tooltip }: { tooltip: TooltipState }) {
  if (!tooltip) return null;

  return (
    <div
      className="pointer-events-none absolute z-10 flex h-10 min-w-10 items-center justify-center rounded-full border border-gray-200 bg-white px-2 text-xs font-semibold text-gray-900 shadow-md"
      style={{
        left: tooltip.x,
        top: tooltip.y,
        color: tooltip.color,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {`${tooltip.percentage.toFixed(0)}%`}
    </div>
  );
}

type SliceData = ChartSegment & { fill: string };

// Extracted so the JSX handler stays a one-liner; event typing is kept
// loose since recharts' Pie callback types aren't worth fighting here.
function handleSectorEnter(
  entry: unknown,
  index: number,
  event: { currentTarget?: unknown },
  data: SliceData[],
  total: number,
  onHover: (tooltip: TooltipState) => void,
) {
  const target = event.currentTarget as
    (Element & { ownerSVGElement?: SVGSVGElement | null }) | undefined;

  if (total === 0 || !target?.ownerSVGElement?.parentElement) return;

  const sector = entry as {
    cx: number;
    cy: number;
    midAngle: number;
    outerRadius: number;
  };

  onHover(hoverTooltipFor(sector, data[index].value, total, data[index].color));
}

// Owns the recharts Pie itself and reports hover state up via onHover.
function HoverTrackingPie({
  data,
  total,
  onHover,
}: {
  data: SliceData[];
  total: number;
  onHover: (tooltip: TooltipState) => void;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="label"
          innerRadius="50%"
          outerRadius="95%"
          startAngle={90}
          endAngle={-270}
          paddingAngle={1}
          stroke="none"
          isAnimationActive={false}
          onMouseEnter={(entry, index, event) =>
            handleSectorEnter(entry, index, event, data, total, onHover)
          }
          onMouseLeave={() => onHover(null)}
        >
          {data.map((segment, index) => (
            <Cell key={`segment-${index}`} fill={segment.color} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}

export default function DonutChart({
  segments,
  className = 'h-36 w-full',
}: DonutChartProps) {
  const [tooltip, setTooltip] = useState<TooltipState>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const data = segments.map((segment) => ({
    ...segment,
    fill: segment.color,
  }));

  const total = data.reduce((sum, segment) => sum + segment.value, 0);

  useHideTooltipOnPointerLeave(containerRef, tooltip, setTooltip);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-visible mb-6 ${className}`}
      onMouseLeave={() => setTooltip(null)}
    >
      <HoverTrackingPie data={data} total={total} onHover={setTooltip} />
      <TooltipBubble tooltip={tooltip} />
    </div>
  );
}
