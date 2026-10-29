import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import HotelPricingTable from '@/app/(application)/[gameId]/[nsoId]/calculator/_components/HotelPricingTable';

describe('HotelPricingTable', () => {
  it('converts saved prices between currencies and preserves missing prices', () => {
    render(<HotelPricingTable />);
    expect(screen.getByText('CONVERSIONS')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'USD' }));
    expect(
      within(screen.getAllByRole('row')[1]).getAllByRole('cell')[1],
    ).toHaveTextContent('543.48');
    expect(
      within(screen.getAllByRole('row')[2]).getAllByRole('cell')[3],
    ).toHaveTextContent('-');
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    fireEvent.change(
      within(screen.getAllByRole('row')[1]).getAllByRole('textbox')[1],
      { target: { value: '100' } },
    );
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    fireEvent.click(screen.getByRole('button', { name: 'CAD' }));
    expect(
      within(screen.getAllByRole('row')[1]).getAllByRole('cell')[1],
    ).toHaveTextContent('138');
    fireEvent.click(screen.getByRole('button', { name: 'EUR' }));
    expect(
      within(screen.getAllByRole('row')[1]).getAllByRole('cell')[1],
    ).toHaveTextContent('93.24');
  });
  it('shows the placeholder hotel prices and an Edit button', () => {
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
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('supports editing, previewing, saving, and cancelling local changes', () => {
    render(<HotelPricingTable />);
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    for (const name of [
      'Cancel',
      'Edit View',
      'Preview',
      'Save',
      'Add New Hotel',
    ]) {
      expect(screen.getByRole('button', { name })).toBeInTheDocument();
    }
    const firstRow = screen.getAllByRole('row')[1];
    fireEvent.change(within(firstRow).getAllByRole('textbox')[1], {
      target: { value: '800' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Preview' }));
    expect(screen.getByText('800')).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(screen.getByText('800')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    fireEvent.change(
      within(screen.getAllByRole('row')[1]).getAllByRole('textbox')[1],
      { target: { value: '850' } },
    );
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.getByText('800')).toBeInTheDocument();
    expect(screen.queryByText('850')).not.toBeInTheDocument();
  });

  it('adds and deletes hotel rows while editing', async () => {
    render(<HotelPricingTable />);
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    fireEvent.click(screen.getByRole('button', { name: 'Add New Hotel' }));
    expect(screen.getAllByRole('row')).toHaveLength(5);
    fireEvent.click(screen.getAllByRole('button', { name: 'delete row' })[3]);
    fireEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: 'Delete',
      }),
    );
    await waitFor(() => expect(screen.getAllByRole('row')).toHaveLength(4));
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
