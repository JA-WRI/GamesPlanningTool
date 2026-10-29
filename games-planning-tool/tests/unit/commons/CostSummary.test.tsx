import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import CostSummary, {
  type CostSummaryData,
} from '@/app/(application)/[gameId]/[nsoId]/calculator/_components/CostSummary';

const data: CostSummaryData = {
  accommodation: 34850,
  travel: 9600,
  food: 3920,
  insurance: 84,
  cellphone: 324,
  clothingPerTraveler: 3200,
  travelers: 6,
  bedNights: 56,
  properties: 3,
};

describe('CostSummary', () => {
  it('totals the categories and shows clothing separately', () => {
    render(<CostSummary data={data} />);
    expect(screen.getByLabelText('Estimated total')).toHaveTextContent(
      '$48,778.00',
    );
    expect(
      screen.getByText('$19,200.00', { exact: false }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        '6 travelers • 56 total traveler-days • 3 properties selected',
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Edit' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Save • View Final Sheet' }),
    ).toBeDisabled();
  });

  it('updates totals from props and converts all amounts to the selected currency', () => {
    const { rerender } = render(<CostSummary data={data} currency="USD" />);
    expect(screen.getByLabelText('Estimated total')).toHaveTextContent(
      'US$35,346.38',
    );
    rerender(<CostSummary data={{ ...data, accommodation: 0 }} />);
    expect(screen.getByLabelText('Estimated total')).toHaveTextContent(
      '$13,928.00',
    );
    expect(screen.getByText('$0.00')).toBeInTheDocument();
  });
});
