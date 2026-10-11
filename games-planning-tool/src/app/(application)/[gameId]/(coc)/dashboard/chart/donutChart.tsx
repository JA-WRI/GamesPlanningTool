// Below 50% AI generated
// Original file was not AI generated, but it has been modified by AI to some extent to fit desired aesthetic.
'use client';

import { useState } from 'react';
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

export default function DonutChart({
  segments,
  className = 'h-36 w-full',
}: DonutChartProps) {
  const [tooltip, setTooltip] = useState<TooltipState>(null);

  const data = segments.map((segment) => ({
    ...segment,
    fill: segment.color,
  }));

  const total = data.reduce((sum, segment) => sum + segment.value, 0);

  return (
    <div
      className={`relative overflow-visible ${className}`}
      onMouseLeave={() => setTooltip(null)}
    >
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
            onMouseEnter={(entry, index, event) => {
              const sector = entry as {
                cx: number;
                cy: number;
                midAngle: number;
                outerRadius: number;
                fill?: string;
                color?: string;
                value: number;
              };

              const svg = event.currentTarget?.ownerSVGElement;
              const container = svg?.parentElement;

              if (!container || total === 0) return;

              const { cx, cy, midAngle, outerRadius } = sector;

              // Position the bubble just outside the segment.
              const angle = (midAngle * Math.PI) / 180;
              const offset = 0.5;
              const radius = outerRadius + offset;

              const x = cx + radius * Math.cos(angle);
              const y = cy - radius * Math.sin(angle);

              setTooltip({
                percentage: (data[index].value / total) * 100,
                x,
                y,
                color: data[index].color,
              });
            }}
            onMouseLeave={() => setTooltip(null)}
          >
            {data.map((segment, index) => (
              <Cell key={`segment-${index}`} fill={segment.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {tooltip && (
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
      )}
    </div>
  );
}
