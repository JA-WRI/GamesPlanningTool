import { render, screen } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
vi.mock('@/server/queries/hotel-pricing', () => ({ getHotelPricing: vi.fn() }));
import { getHotelPricing } from '@/server/queries/hotel-pricing';
import HotelPricingSection from '@/features/nso-calculator/components/HotelPricingSection';
beforeEach(() => {
  vi.mocked(getHotelPricing).mockReset();
});
it('renders a safe error without leaking database details', async () => {
  vi.mocked(getHotelPricing).mockRejectedValue(
    new Error('sensitive database detail'),
  );
  render(await HotelPricingSection({ gameId: 1 }));
  expect(screen.getByRole('alert')).toHaveTextContent(
    'Hotel pricing is temporarily unavailable',
  );
  expect(
    screen.queryByText(/sensitive database detail/),
  ).not.toBeInTheDocument();
});
it('renders fetched hotels', async () => {
  vi.mocked(getHotelPricing).mockResolvedValue([
    { id: 'a', hotel: 'Database Hotel', prices: {} },
  ]);
  render(await HotelPricingSection({ gameId: 3 }));
  expect(getHotelPricing).toHaveBeenCalledWith(3);
  expect(screen.getByText('Database Hotel')).toBeInTheDocument();
});
