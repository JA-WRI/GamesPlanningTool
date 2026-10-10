'use client';

import { PieChart, Pie, ResponsiveContainer, Tooltip } from 'recharts';
import type { ChartSegment } from './types';

type DonutChartProps = {
  segments: ChartSegment[];
  className?: string;
};

export default function DonutChart({
  segments,
  className = 'h-36 w-full',
}: DonutChartProps) {
  const data = segments.map((s) => ({ ...s, fill: s.color }));
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            innerRadius="30%"
            outerRadius="95%"
            startAngle={90}
            endAngle={-270}
            paddingAngle={1}
            stroke="none"
            isAnimationActive={false}
          />
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
