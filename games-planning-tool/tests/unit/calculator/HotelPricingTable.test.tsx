// AI contributed to these tests; reviewed for calculator requirements.
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import HotelPricingTable from '@/features/nso-calculator/components/HotelPricingTable';

describe('HotelPricingTable', () => {
  it('shows the hotel prices as a read-only table without currency controls', () => {
    render(<HotelPricingTable />);

    expect(
      screen.getByRole('heading', { name: 'HOTEL PRICING' }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole('columnheader').map((cell) => cell.textContent),
    ).toEqual([
      'Hotel',
      'Price for single',
      'Price for double',
      'Price for triple',
    ]);
    const rows = screen.getAllByRole('row').slice(1);
    expect(
      rows.map((row) =>
        within(row)
          .getAllByRole('cell')
          .map((cell) => cell.textContent),
      ),
    ).toEqual([
      ['Milano - UNA Mediterraneo', '750', '375', '900'],
      ['Milano - NH Milano Congress Centre', '750', '375', '-'],
      ['Milano - NH Milano Fiera', '750', '375', '-'],
    ]);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByText('CONVERSIONS')).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('updates columns when occupancies are removed or a new type is configured', () => {
    const { rerender } = render(
      <HotelPricingTable occupancyTypes={['single', 'double']} />,
    );
    expect(screen.getAllByRole('columnheader')).toHaveLength(3);
    expect(screen.queryByText('Price for triple')).not.toBeInTheDocument();

    rerender(
      <HotelPricingTable
        occupancyTypes={['single', 'double', 'triple', 'quad']}
      />,
    );
    expect(screen.getAllByRole('columnheader')).toHaveLength(5);
    expect(screen.getByText('Price for quad')).toBeInTheDocument();
    const rows = screen.getAllByRole('row').slice(1);
    for (const row of rows) {
      expect(within(row).getAllByRole('cell')[4]).toHaveTextContent('-');
    }
    expect(within(rows[0]).getAllByRole('cell')[3]).toHaveTextContent('900');
  });
});
