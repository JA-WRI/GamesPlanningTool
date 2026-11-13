//AI usage: over 50%
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import PropertyPricingTable from '@/features/nso-calculator/components/PropertyPricingTable';
import type {
  PropertyPricingColumn,
  PropertyPricingRow,
  PropertyPricingTable as PropertyPricingTableData,
} from '@/features/nso-calculator/property-pricing';

const single: PropertyPricingColumn = {
  code: 'single',
  label: 'Price for single',
};
const double: PropertyPricingColumn = {
  code: 'double',
  label: 'Price for double',
};
const triple: PropertyPricingColumn = {
  code: 'triple',
  label: 'Price for triple',
};

const row = (
  id: string,
  name: string,
  prices: Record<string, string>,
  clusterName = 'Cluster X',
): PropertyPricingRow => ({ id, clusterName, name, prices });

const makeTable = (
  columns: PropertyPricingColumn[],
  rows: PropertyPricingRow[],
): PropertyPricingTableData => ({ columns, rows });

const expectedHeaders = (columns: PropertyPricingColumn[]) => [
  'Property',
  ...columns.map((c) => c.label),
];

const expectedCells = (
  r: PropertyPricingRow,
  columns: PropertyPricingColumn[],
) => [
  `${r.clusterName} - ${r.name}`,
  ...columns.map((c) => r.prices[c.code] ?? '-'),
];

const renderedCells = (rowIndex: number) =>
  within(screen.getAllByRole('row')[rowIndex])
    .getAllByRole('cell')
    .map((cell) => cell.textContent);

describe('PropertyPricingTable', () => {
  it('shows supplied prices, zero and missing occupancy as a read-only table', () => {
    const columns = [single, double, triple];
    const rows = [
      row('a', 'Property One', { single: '125.50', double: '0.00' }),
    ];
    render(<PropertyPricingTable table={makeTable(columns, rows)} />);

    expect(
      screen.getAllByRole('columnheader').map((cell) => cell.textContent),
    ).toEqual(expectedHeaders(columns));
    expect(renderedCells(1)).toEqual(expectedCells(rows[0], columns));
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.getByText('Prices per room, per night.')).toBeInTheDocument();
  });

  it('displays an explicit empty state with no property names', () => {
    render(<PropertyPricingTable table={makeTable([], [])} />);

    expect(screen.getByRole('status')).toHaveTextContent(
      'No property pricing configured',
    );
    expect(screen.getAllByRole('row')).toHaveLength(1);
  });

  it('puts every property in one table and fills dashes where a column is not offered', () => {
    const columns = [single, double, triple];
    const rows = [
      row(
        'a',
        'Property One',
        { single: '100.00', triple: '900.00' },
        'Cluster X',
      ),
      row('b', 'Property Two', { single: '110.00' }, 'Cluster Y'),
    ];
    render(<PropertyPricingTable table={makeTable(columns, rows)} />);

    expect(screen.getAllByRole('row')).toHaveLength(rows.length + 1);
    rows.forEach((r, i) => {
      expect(renderedCells(i + 1)).toEqual(expectedCells(r, columns));
    });
  });

  it('renders only the columns it is given', () => {
    const columns = [single, double];
    const rows = [
      row('a', 'Property One', { single: '100.00', double: '200.00' }),
    ];
    render(<PropertyPricingTable table={makeTable(columns, rows)} />);

    expect(
      screen.getAllByRole('columnheader').map((cell) => cell.textContent),
    ).toEqual(expectedHeaders(columns));
    expect(screen.queryByText(triple.label)).not.toBeInTheDocument();
  });

  it('refreshes changed prices and clears removed properties without a parent remount', () => {
    const columns = [single, double, triple];
    const before = [row('a', 'Property One', { single: '125.50' })];
    const after = [row('a', 'Property One', { double: '0.00' })];

    const { rerender } = render(
      <PropertyPricingTable table={makeTable(columns, before)} />,
    );
    rerender(<PropertyPricingTable table={makeTable(columns, after)} />);

    expect(screen.queryByText(before[0].prices.single)).not.toBeInTheDocument();
    expect(renderedCells(1)).toEqual(expectedCells(after[0], columns));

    rerender(<PropertyPricingTable table={makeTable([], [])} />);
    expect(
      screen.queryByText(`${after[0].clusterName} - ${after[0].name}`),
    ).not.toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(1);
    expect(screen.getByRole('status')).toHaveTextContent(
      'No property pricing configured',
    );
  });

  it('shows only the new game data when remounted with a game key', () => {
    const gameOne = row('a', 'Game One Property', {});
    const gameTwo = row('b', 'Game Two Property', {});

    const { rerender } = render(
      <PropertyPricingTable key={1} table={makeTable([single], [gameOne])} />,
    );
    rerender(
      <PropertyPricingTable key={2} table={makeTable([single], [gameTwo])} />,
    );

    expect(
      screen.queryByText(`${gameOne.clusterName} - ${gameOne.name}`),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(`${gameTwo.clusterName} - ${gameTwo.name}`),
    ).toBeInTheDocument();
  });
});
