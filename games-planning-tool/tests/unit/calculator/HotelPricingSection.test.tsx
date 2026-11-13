// AI-assisted tests; reviewed for calculator and hotel pricing requirements.
import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
vi.mock('@/server/queries/hotel-pricing', () => ({ getHotelPricing: vi.fn() }));
vi.mock('@/lib/draft-actions', () => ({
  saveDraftDocument: vi.fn(),
  deleteDraftDocument: vi.fn(),
}));
import { getHotelPricing } from '@/server/queries/hotel-pricing';
import HotelPricingSection from '@/features/nso-calculator/components/HotelPricingSection';
afterEach(() => vi.restoreAllMocks());
beforeEach(() => {
  vi.mocked(getHotelPricing).mockReset();
});
it('renders a safe error without leaking database details', async () => {
  const log = vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.mocked(getHotelPricing).mockRejectedValue(
    Object.assign(new Error('sensitive database detail'), { code: 'P2021' }),
  );
  render(await HotelPricingSection({ gameId: 1 }));
  expect(log).toHaveBeenCalledExactlyOnceWith('Failed to load hotel pricing', {
    gameId: 1,
    code: 'P2021',
  });
  expect(JSON.stringify(log.mock.calls)).not.toContain(
    'sensitive database detail',
  );
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
