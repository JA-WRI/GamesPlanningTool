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
  } catch {
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
