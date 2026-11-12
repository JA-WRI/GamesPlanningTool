import { fireEvent, render, screen, within } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import CalculatorClient from '@/features/nso-calculator/components/CalculatorClient';
import HotelPricingTable from '@/features/nso-calculator/components/HotelPricingTable';

vi.mock('next/navigation', () => ({ useParams: () => ({ gameId: '7' }) }));

it('combines saved calculator and estimated costs with database hotel pricing', () => {
  render(
    <CalculatorClient>
      <HotelPricingTable
        hotels={[
          {
            id: 'hotel',
            hotel: 'Database Hotel',
            prices: { single: '125.50' },
          },
        ]}
      />
    </CalculatorClient>,
  );
  expect(screen.getByText('Database Hotel')).toBeInTheDocument();
  expect(screen.getByText('125.50')).toBeInTheDocument();
  expect(
    screen.queryByText('Milano - UNA Mediterraneo'),
  ).not.toBeInTheDocument();
  const headings = screen
    .getAllByRole('heading')
    .map((heading) => heading.textContent);
  expect(headings.indexOf('ESTIMATED COSTS')).toBeLessThan(
    headings.indexOf('HOTEL PRICING'),
  );
  expect(headings.indexOf('HOTEL PRICING')).toBeLessThan(
    headings.indexOf('COST SUMMARY'),
  );

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
  expect(screen.getByLabelText('Estimated total')).toHaveTextContent('$0.00');
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  expect(screen.getByLabelText('Estimated total')).toHaveTextContent(
    '$7,240.00',
  );

  fireEvent.click(screen.getAllByRole('button', { name: 'Edit' })[1]);
  const costsTable = screen.getAllByRole('table')[1];
  const cellphoneRow = within(costsTable).getAllByRole('row')[4];
  fireEvent.change(within(cellphoneRow).getByRole('spinbutton'), {
    target: { value: '10' },
  });
  expect(screen.getByLabelText('Estimated total')).toHaveTextContent(
    '$7,240.00',
  );
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  expect(screen.getByLabelText('Estimated total')).toHaveTextContent(
    '$6,652.00',
  );

  fireEvent.click(screen.getByRole('button', { name: 'USD' }));
  expect(screen.getByLabelText('Estimated total')).toHaveTextContent(
    'US$4,820.29',
  );
  expect(screen.getByText('125.50')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'CAD' }));
  expect(screen.getByLabelText('Estimated total')).toHaveTextContent(
    '$6,652.00',
  );
});
