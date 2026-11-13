export const OCCUPANCY_TYPES = ['single', 'double', 'triple'] as const;
export type Occupancy = (typeof OCCUPANCY_TYPES)[number];

export type HotelPricingData = {
  id: string;
  hotel: string;
  // Decimal strings preserve database precision across the server/client boundary.
  prices: Partial<Record<Occupancy, string>>;
};
