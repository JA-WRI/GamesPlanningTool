import { getHotelPricing } from '@/server/queries/hotel-pricing';
import HotelPricingTable from './HotelPricingTable';

export default async function HotelPricingSection({
  gameId,
}: {
  gameId: number;
}) {
  let hotels;
  try {
    hotels = await getHotelPricing(gameId);
  } catch (error) {
    // Log a diagnostic code without logging credentials from database messages.
    const code =
      error &&
      typeof error === 'object' &&
      'code' in error &&
      typeof error.code === 'string' &&
      /^P\d{4}$/.test(error.code)
        ? error.code
        : undefined;
    console.error('Failed to load hotel pricing', { gameId, code });
    // Do not expose connection strings or database error details to the browser.
    return (
      <section
        className="mt-10 p-6 bg-white rounded-lg border border-gray-200"
        role="alert"
      >
        <h2>HOTEL PRICING</h2>
        <p>
          Hotel pricing is temporarily unavailable. Please reload to try again.
        </p>
      </section>
    );
  }
  return <HotelPricingTable key={gameId} hotels={hotels} />;
}
