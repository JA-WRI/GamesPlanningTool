//50% or more AI-generated
import { describe, it, expect, beforeAll } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import DonutChart from '../../../src/app/(application)/[gameId]/(coc)/dashboard/chart/donutChart';
import { mockChartLayout } from './chartTestUtils';

beforeAll(() => {
  mockChartLayout();
});

const segments = [
  { key: 'a', label: 'Not Started', value: 3, color: '#6b7280' },
  { key: 'b', label: 'Completed', value: 7, color: '#84cc16' },
];

describe('DonutChart', () => {
  it('renders one sector per segment', () => {
    const { container } = render(<DonutChart segments={segments} />);

    expect(container.querySelectorAll('path.recharts-sector')).toHaveLength(
      segments.length,
    );
  });

  it('shows no tooltip bubble before any interaction', () => {
    const { container } = render(<DonutChart segments={segments} />);

    expect(container.querySelector('.pointer-events-none')).toBeNull();
  });

  it('shows the hovered segment percentage on mouse enter', () => {
    const { container, getByText } = render(
      <DonutChart segments={segments} />,
    );

    const sectors = container.querySelectorAll('path.recharts-sector');
    fireEvent.mouseEnter(sectors[1]);

    expect(getByText('70%')).toBeInTheDocument();
  });

  it('hides the tooltip bubble when the pointer leaves the whole chart', () => {
    const { container, queryByText } = render(
      <DonutChart segments={segments} />,
    );

    const sectors = container.querySelectorAll('path.recharts-sector');
    fireEvent.mouseEnter(sectors[0]);
    fireEvent.mouseLeave(container.firstChild as Element);

    expect(queryByText('30%')).not.toBeInTheDocument();
  });

  it('does not throw when every segment is empty', () => {
    const empty = segments.map((segment) => ({ ...segment, value: 0 }));

    expect(() => render(<DonutChart segments={empty} />)).not.toThrow();
  });

  it('hides the tooltip bubble once the cursor is outside the chart, even without a leave event on the sector', () => {
    // Moving the cursor fast enough can jump straight from a sector to
    // outside the chart without ever firing that sector's own mouse-leave
    // event. A document-wide pointer move should still clear the bubble.
    const { container, getByText, queryByText } = render(
      <DonutChart segments={segments} />,
    );

    const sectors = container.querySelectorAll('path.recharts-sector');
    fireEvent.mouseEnter(sectors[0]);
    expect(getByText('30%')).toBeInTheDocument();

    fireEvent(
      document,
      new MouseEvent('pointermove', {
        bubbles: true,
        clientX: 1000,
        clientY: 1000,
      }),
    );

    expect(queryByText('30%')).not.toBeInTheDocument();
  });

  it('keeps the tooltip bubble visible while the cursor stays inside the chart', () => {
    const { container, getByText } = render(<DonutChart segments={segments} />);

    const sectors = container.querySelectorAll('path.recharts-sector');
    fireEvent.mouseEnter(sectors[0]);

    fireEvent(
      document,
      new MouseEvent('pointermove', {
        bubbles: true,
        clientX: 100,
        clientY: 100,
      }),
    );

    expect(getByText('30%')).toBeInTheDocument();
  });
});
