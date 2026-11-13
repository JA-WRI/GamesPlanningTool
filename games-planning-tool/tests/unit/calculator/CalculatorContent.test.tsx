//AI usage: over 50%
import { fireEvent, render, screen, within } from '@testing-library/react';
import { expect, it } from 'vitest';
import CalculatorClient from '@/features/nso-calculator/components/CalculatorClient';
import PropertyPricingTable from '@/features/nso-calculator/components/PropertyPricingTable';
import type { PropertyPricingTable as PropertyPricingTableData } from '@/features/nso-calculator/property-pricing';

// Single source of truth for the property data rendered below.
const pricing: PropertyPricingTableData = {
  columns: [{ code: 'single', label: 'Price for single' }],
  rows: [
    {
      id: 'property',
      clusterName: 'Database Cluster',
      name: 'Database Property',
      prices: { single: '125.50' },
    },
  ],
};
const [property] = pricing.rows;
const propertyLabel = `${property.clusterName} - ${property.name}`;
const propertyPrice = property.prices.single;

it('preserves calculator and estimated costs with database properties while Cost Summary is deferred', () => {
  render(
    <CalculatorClient gameName="Database Games">
      <PropertyPricingTable table={pricing} />
    </CalculatorClient>,
  );
  expect(
    screen.getByRole('heading', { name: 'Database Games' }),
  ).toBeInTheDocument();
  expect(screen.queryByText('SELECT A GAME')).not.toBeInTheDocument();
  expect(screen.getByText(propertyLabel)).toBeInTheDocument();
  expect(screen.getByText(propertyPrice)).toBeInTheDocument();
  expect(
    screen.queryByText('Milano - UNA Mediterraneo'),
  ).not.toBeInTheDocument();
  const headings = screen
    .getAllByRole('heading')
    .map((heading) => heading.textContent);
  expect(headings.indexOf('ESTIMATED COSTS')).toBeLessThan(
    headings.indexOf('PROPERTY PRICING'),
  );
  expect(
    screen.queryByRole('region', { name: 'Cost summary' }),
  ).not.toBeInTheDocument();
  expect(screen.queryByLabelText('Estimated total')).not.toBeInTheDocument();

  fireEvent.click(screen.getAllByRole('button', { name: 'Edit' })[0]);
  const row = screen.getAllByRole('table')[0].querySelectorAll('tbody tr')[0];
  const inputs = within(row as HTMLElement).getAllByRole('spinbutton');
  // Members, days, travel, accommodation, meals, insurance, total/member.
  for (const [index, value] of [
    [0, 2],
    [1, 3],
    [2, 2400],
    [3, 750],
    [4, 118],
    [5, 28],
  ]) {
    fireEvent.change(inputs[index], { target: { value: String(value) } });
  }
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  expect(
    within(screen.getAllByRole('table')[0]).getByText('2400'),
  ).toBeInTheDocument();

  fireEvent.click(screen.getAllByRole('button', { name: 'Edit' })[1]);
  const costsTable = screen.getAllByRole('table')[1];
  const cellphoneRow = within(costsTable).getAllByRole('row')[4];
  fireEvent.change(within(cellphoneRow).getByRole('spinbutton'), {
    target: { value: '10' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  expect(
    within(screen.getAllByRole('table')[1]).getByText('10'),
  ).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'USD' }));
  expect(
    within(screen.getAllByRole('table')[0]).getByText('1739.13'),
  ).toBeInTheDocument();
  expect(
    within(screen.getAllByRole('table')[1]).getByText('7.25'),
  ).toBeInTheDocument();
  // Property prices are not converted by the currency toggle
  expect(screen.getByText(propertyPrice)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'CAD' }));
  expect(
    within(screen.getAllByRole('table')[0]).getByText('2400'),
  ).toBeInTheDocument();
  expect(
    within(screen.getAllByRole('table')[1]).getByText('10'),
  ).toBeInTheDocument();
  expect(screen.queryByLabelText('Estimated total')).not.toBeInTheDocument();
});
