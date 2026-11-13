// AI-assisted tests; reviewed for calculator and hotel pricing requirements.
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import CalculatorClient from '@/features/nso-calculator/components/CalculatorClient';
import HotelPricingTable from '@/features/nso-calculator/components/HotelPricingTable';
import { saveDraftDocument } from '@/lib/draft-actions';

vi.mock('@/lib/draft-actions', () => ({
  saveDraftDocument: vi.fn().mockResolvedValue(undefined),
  deleteDraftDocument: vi.fn().mockResolvedValue(undefined),
}));

it('preserves calculator and estimated costs with database hotels while Cost Summary is deferred', async () => {
  const saveTravelers = vi.fn(async (_id, rows) => rows);
  const saveCosts = vi.fn(async (_id, rows) => rows);
  render(
    <CalculatorClient
      calculatorId={1}
      gameName="Games"
      travelerDraftKey="travelers"
      estimatedCostsDraftKey="costs"
      onSaveTravelers={saveTravelers}
      onSaveEstimatedCosts={saveCosts}
    >
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
  fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
  await waitFor(() => expect(saveTravelers).toHaveBeenCalledOnce());
  await waitFor(() =>
    expect(
      within(screen.getAllByRole('table')[0]).getByText('2400'),
    ).toBeInTheDocument(),
  );

  fireEvent.click(screen.getAllByRole('button', { name: 'Edit' })[1]);
  const costsTable = screen.getAllByRole('table')[1];
  const cellphoneRow = within(costsTable).getAllByRole('row')[4];
  fireEvent.change(within(cellphoneRow).getByRole('spinbutton'), {
    target: { value: '10' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
  await waitFor(() => expect(saveCosts).toHaveBeenCalledOnce());
  await waitFor(() =>
    expect(
      within(screen.getAllByRole('table')[1]).getByText('10'),
    ).toBeInTheDocument(),
  );

  fireEvent.click(screen.getByRole('button', { name: 'USD' }));
  await waitFor(() =>
    expect(
      within(screen.getAllByRole('table')[0]).getByText('1739.13'),
    ).toBeInTheDocument(),
  );
  expect(
    within(screen.getAllByRole('table')[1]).getByText('7.25'),
  ).toBeInTheDocument();
  expect(screen.getByText('125.50')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'CAD' }));
  await waitFor(() =>
    expect(
      within(screen.getAllByRole('table')[0]).getByText('2400'),
    ).toBeInTheDocument(),
  );
  expect(
    within(screen.getAllByRole('table')[1]).getByText('10'),
  ).toBeInTheDocument();
  expect(screen.queryByLabelText('Estimated total')).not.toBeInTheDocument();
});

it('flushes both drafts in CAD before switching currency and restores them on reload', async () => {
  vi.mocked(saveDraftDocument).mockClear();
  const props = {
    calculatorId: 1,
    gameName: 'Games',
    travelerDraftKey: 'travelers',
    estimatedCostsDraftKey: 'costs',
    onSaveTravelers: vi.fn(async (_id, rows) => rows),
    onSaveEstimatedCosts: vi.fn(async (_id, rows) => rows),
  } satisfies React.ComponentProps<typeof CalculatorClient>;
  const { unmount } = render(<CalculatorClient {...props} />);
  const tables = screen.getAllByRole('table');

  fireEvent.click(screen.getAllByRole('button', { name: 'Edit' })[0]);
  fireEvent.change(within(tables[0]).getAllByRole('spinbutton')[2], {
    target: { value: '276' },
  });
  fireEvent.click(screen.getAllByRole('button', { name: 'Edit' })[0]);
  const costsRow = within(tables[1]).getAllByRole('row')[1];
  fireEvent.change(within(costsRow).getByRole('spinbutton'), {
    target: { value: '138' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'USD' }));

  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'USD' })).toHaveAttribute(
      'aria-pressed',
      'true',
    ),
  );
  expect(
    within(screen.getAllByRole('table')[0]).getByText('200'),
  ).toBeInTheDocument();
  expect(
    within(screen.getAllByRole('table')[1]).getByText('100'),
  ).toBeInTheDocument();
  expect(props.onSaveTravelers).not.toHaveBeenCalled();
  expect(props.onSaveEstimatedCosts).not.toHaveBeenCalled();

  const calls = vi.mocked(saveDraftDocument).mock.calls;
  const travelerDraft = calls.find(([key]) => key === 'travelers')?.[1];
  const costsDraft = calls.find(([key]) => key === 'costs')?.[1];
  expect(travelerDraft).toEqual(
    expect.arrayContaining([expect.objectContaining({ travelBudget: 276 })]),
  );
  expect(costsDraft).toEqual({
    rows: expect.arrayContaining([expect.objectContaining({ amount: 138 })]),
  });

  unmount();
  render(
    <CalculatorClient
      {...props}
      initialTravelerDraft={travelerDraft}
      initialEstimatedCostsDraft={costsDraft}
    />,
  );
  expect(
    within(screen.getAllByRole('table')[0]).getByText('276'),
  ).toBeInTheDocument();
  expect(
    within(screen.getAllByRole('table')[1]).getByText('138'),
  ).toBeInTheDocument();
  expect(
    screen
      .getAllByRole('status', { name: '' })
      .filter((status) => status.textContent === 'Draft restored'),
  ).toHaveLength(2);
});

it('keeps the currency and edits when a draft flush fails', async () => {
  vi.mocked(saveDraftDocument).mockRejectedValueOnce(new Error('save failed'));
  const alert = vi.spyOn(window, 'alert').mockImplementation(() => {});
  render(
    <CalculatorClient
      calculatorId={1}
      gameName="Games"
      travelerDraftKey="travelers"
      estimatedCostsDraftKey="costs"
      onSaveTravelers={vi.fn(async (_id, rows) => rows)}
      onSaveEstimatedCosts={vi.fn(async (_id, rows) => rows)}
    />,
  );
  fireEvent.click(screen.getAllByRole('button', { name: 'Edit' })[0]);
  const travelInput = within(screen.getAllByRole('table')[0]).getAllByRole(
    'spinbutton',
  )[2];
  fireEvent.change(travelInput, { target: { value: '276' } });
  fireEvent.click(screen.getByRole('button', { name: 'USD' }));

  await waitFor(() =>
    expect(alert).toHaveBeenCalledWith(
      'Could not save your draft. Currency was not changed.',
    ),
  );
  expect(screen.getByRole('button', { name: 'CAD' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  expect(travelInput).toHaveValue(276);
  alert.mockRestore();
});
