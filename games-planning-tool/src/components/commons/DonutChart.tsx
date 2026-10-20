// Below 50% AI generated
// Original file was not AI generated, but it has been modified by AI to some extent to fit desired aesthetic.
'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import type { ChartSegment } from './chartTypes';

type DonutChartProps = {
  segments: ChartSegment[];
  className?: string;
  // When provided, each sector becomes clickable (with a hover affordance)
  // and reports which segment was clicked.
  onSegmentClick?: (segment: ChartSegment, index: number) => void;
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

// Extracted so the JSX handler stays a one-liner; event typing is kept
// loose since recharts' Pie callback types aren't worth fighting here.
function handleSectorEnter(
  entry: unknown,
  index: number,
  event: { currentTarget?: unknown },
  segments: ChartSegment[],
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

  onHover(
    hoverTooltipFor(
      sector,
      segments[index].value,
      total,
      segments[index].color,
    ),
  );
}

// Owns the recharts Pie itself and reports hover state up via onHover.
function HoverTrackingPie({
  segments,
  total,
  onHover,
  onSegmentClick,
}: {
  segments: ChartSegment[];
  total: number;
  onHover: (tooltip: TooltipState) => void;
  onSegmentClick?: (segment: ChartSegment, index: number) => void;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={segments}
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
            handleSectorEnter(entry, index, event, segments, total, onHover)
          }
          onMouseLeave={() => onHover(null)}
          onClick={
            onSegmentClick
              ? (_entry, index, event) => {
                  // The card this chart lives in is itself clickable and
                  // opens the panel to a default status; stop the event
                  // here so a sector click only reports its own segment.
                  event?.stopPropagation?.();
                  onSegmentClick(segments[index], index);
                }
              : undefined
          }
        >
          {segments.map((segment, index) => (
            <Cell key={`segment-${index}`} fill={segment.color} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}

// Generic donut chart: renders `segments` as a recharts donut with a
// percentage tooltip on hover. Has no knowledge of status colours or any
// other dashboard-specific concept, so it can be reused anywhere a set of
// labelled/coloured values needs to be visualized. Callers fully control
// sizing and spacing via `className`.
export default function DonutChart({
  segments,
  className = 'h-36 w-full',
  onSegmentClick,
}: DonutChartProps) {
  const [tooltip, setTooltip] = useState<TooltipState>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const total = segments.reduce((sum, segment) => sum + segment.value, 0);

  useHideTooltipOnPointerLeave(containerRef, tooltip, setTooltip);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-visible ${className} ${
        onSegmentClick
          ? '[&_.recharts-sector]:cursor-pointer [&_.recharts-sector]:transition-opacity [&_.recharts-sector:hover]:opacity-80'
          : ''
      }`}
      onMouseLeave={() => setTooltip(null)}
    >
      <HoverTrackingPie
        segments={segments}
        total={total}
        onHover={setTooltip}
        onSegmentClick={onSegmentClick}
      />
      <TooltipBubble tooltip={tooltip} />
    </div>
  );
}
