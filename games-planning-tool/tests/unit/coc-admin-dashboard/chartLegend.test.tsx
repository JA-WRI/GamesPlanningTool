//50% or more AI-generated
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ChartLegend from '../../../src/app/(application)/[gameId]/(coc)/dashboard/chart/ChartLegend';
import { statusLegendItems } from '../../../src/components/commons/status';

describe('ChartLegend', () => {
  it('renders a label for every item', () => {
    render(<ChartLegend items={statusLegendItems} />);

    statusLegendItems.forEach((item) => {
      expect(screen.getByText(item.label)).toBeInTheDocument();
    });
  });

  it('renders one colour swatch per item with the matching colour', () => {
    const { container } = render(<ChartLegend items={statusLegendItems} />);

    const swatches = container.querySelectorAll('span.inline-block');
    expect(swatches).toHaveLength(statusLegendItems.length);
    swatches.forEach((swatch, i) => {
      expect(swatch).toHaveStyle({
        backgroundColor: statusLegendItems[i].color,
      });
    });
  });

  it('renders nothing but the list wrapper when given no items', () => {
    render(<ChartLegend items={[]} />);

    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  });
});
