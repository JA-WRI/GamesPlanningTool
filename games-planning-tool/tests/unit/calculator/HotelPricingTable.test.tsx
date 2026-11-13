// AI-assisted tests; reviewed for calculator and hotel pricing requirements.
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import HotelPricingTable from '@/features/nso-calculator/components/PropertyPricingTable';
describe('HotelPricingTable', () => {
  it('shows supplied rates, zero and missing occupancy as a read-only table', () => {
    render(
      <HotelPricingTable
        hotels={[
          {
            id: 'a',
            hotel: 'Approved Hotel',
            prices: { single: '125.50', double: '0.00' },
          },
        ]}
      />,
    );
    expect(
      screen.getAllByRole('columnheader').map((cell) => cell.textContent),
    ).toEqual([
      'Hotel',
      'Price for single',
      'Price for double',
      'Price for triple',
    ]);
    expect(
      within(screen.getAllByRole('row')[1])
        .getAllByRole('cell')
        .map((cell) => cell.textContent),
    ).toEqual(['Approved Hotel', '125.50', '0.00', '-']);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.getByText('Prices per room, per night.')).toBeInTheDocument();
  });
  it('displays an explicit empty state with no mock hotel names', () => {
    render(<HotelPricingTable hotels={[]} />);
    expect(screen.getByRole('status')).toHaveTextContent(
      'No hotel pricing configured',
    );
    expect(screen.getAllByRole('row')).toHaveLength(1);
  });
  it('keeps missing rates as dashes and supplied triple rates visible', () => {
    render(
      <HotelPricingTable
        hotels={[
          { id: 'a', hotel: 'Approved Hotel', prices: { triple: '900.00' } },
        ]}
      />,
    );
    expect(
      within(screen.getAllByRole('row')[1])
        .getAllByRole('cell')
        .map((cell) => cell.textContent),
    ).toEqual(['Approved Hotel', '-', '-', '900.00']);
    expect(screen.queryByText('CONVERSIONS')).not.toBeInTheDocument();
  });

  it('refreshes changed rates and clears removed hotels without a parent remount', () => {
    const { rerender } = render(
      <HotelPricingTable
        hotels={[
          { id: 'a', hotel: 'Approved Hotel', prices: { single: '125.50' } },
        ]}
      />,
    );
    rerender(
      <HotelPricingTable
        hotels={[
          { id: 'a', hotel: 'Approved Hotel', prices: { double: '0.00' } },
        ]}
      />,
    );
    expect(screen.queryByText('125.50')).not.toBeInTheDocument();
    expect(
      within(screen.getAllByRole('row')[1])
        .getAllByRole('cell')
        .map((cell) => cell.textContent),
    ).toEqual(['Approved Hotel', '-', '0.00', '-']);
    rerender(<HotelPricingTable hotels={[]} />);
    expect(screen.queryByText('Approved Hotel')).not.toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(1);
    expect(screen.getByRole('status')).toHaveTextContent(
      'No hotel pricing configured',
    );
  });

  it('shows only the new game data when remounted with a game key', () => {
    const { rerender } = render(
      <HotelPricingTable
        key={1}
        hotels={[{ id: 'a', hotel: 'Game One Hotel', prices: {} }]}
      />,
    );
    rerender(
      <HotelPricingTable
        key={2}
        hotels={[{ id: 'b', hotel: 'Game Two Hotel', prices: {} }]}
      />,
    );
    expect(screen.queryByText('Game One Hotel')).not.toBeInTheDocument();
    expect(screen.getByText('Game Two Hotel')).toBeInTheDocument();
  });
});
