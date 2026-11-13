//AI usage: over 50%
import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
vi.mock('@/server/queries/property-pricing', () => ({
  getPropertyPricing: vi.fn(),
}));
import { getPropertyPricing } from '@/server/queries/property-pricing';
import PropertyPricingSection from '@/features/nso-calculator/components/PropertyPricingSection';

import type {
  PropertyPricingColumn,
  PropertyPricingRow,
} from '@/features/nso-calculator/property-pricing';

afterEach(() => vi.restoreAllMocks());
beforeEach(() => {
  vi.mocked(getPropertyPricing).mockReset();
});

const columns: PropertyPricingColumn[] = [
  { code: 'single', label: 'Price for single' },
  { code: 'double', label: 'Price for double' },
  { code: 'triple', label: 'Price for triple' },
];

const rows: PropertyPricingRow[] = [
  {
    id: 'a',
    clusterName: 'Cluster X',
    name: 'Property One',
    prices: { single: '100.00', double: '200.00', triple: '300.00' },
  },
  {
    id: 'b',
    clusterName: 'Cluster Y',
    name: 'Property Two',
    prices: { single: '110.00', double: '210.00' },
  },
];

it('renders a safe error without leaking database details', async () => {
  const log = vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.mocked(getPropertyPricing).mockRejectedValue(
    Object.assign(new Error('sensitive database detail'), { code: 'P2021' }),
  );
  render(await PropertyPricingSection({ gameId: 1 }));
  expect(log).toHaveBeenCalledExactlyOnceWith(
    'Failed to load property pricing',
    { gameId: 1, code: 'P2021' },
  );
  expect(JSON.stringify(log.mock.calls)).not.toContain(
    'sensitive database detail',
  );
  expect(screen.getByRole('alert')).toHaveTextContent(
    'Property pricing is temporarily unavailable',
  );
  expect(
    screen.queryByText(/sensitive database detail/),
  ).not.toBeInTheDocument();
});

it('renders the fetched properties and a header for every column', async () => {
  vi.mocked(getPropertyPricing).mockResolvedValue({ columns, rows });
  render(await PropertyPricingSection({ gameId: 3 }));

  expect(getPropertyPricing).toHaveBeenCalledWith(3);
  for (const { clusterName, name } of rows) {
    expect(screen.getByText(`${clusterName} - ${name}`)).toBeInTheDocument();
  }
  for (const { label } of columns) {
    expect(screen.getByText(label)).toBeInTheDocument();
  }
});

it('shows each offered price and a dash for every price a property does not offer', async () => {
  vi.mocked(getPropertyPricing).mockResolvedValue({ columns, rows });
  render(await PropertyPricingSection({ gameId: 3 }));

  const missing = rows.flatMap((row) =>
    columns.filter(({ code }) => !(code in row.prices)),
  ).length;
  expect(screen.getAllByText('-')).toHaveLength(missing);

  for (const { prices } of rows) {
    for (const price of Object.values(prices)) {
      expect(screen.getAllByText(price).length).toBeGreaterThan(0);
    }
  }
});

it('renders an empty state when the game has no properties', async () => {
  vi.mocked(getPropertyPricing).mockResolvedValue({ columns: [], rows: [] });
  render(await PropertyPricingSection({ gameId: 3 }));

  expect(screen.getByRole('status')).toHaveTextContent(
    'No property pricing configured',
  );
});
