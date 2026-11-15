//AI usage: over 50%
import { getPropertyPricing } from '@/server/queries/property-pricing';
import PropertyPricingTable from './PropertyPricingTable';

export default async function PropertyPricingSection({
  gameId,
}: {
  gameId: number;
}) {
  let table;
  try {
    table = await getPropertyPricing(gameId);
  } catch (error) {
    const code =
      error &&
      typeof error === 'object' &&
      'code' in error &&
      typeof error.code === 'string' &&
      /^P\d{4}$/.test(error.code)
        ? error.code
        : undefined;
    console.error('Failed to load property pricing', { gameId, code });
    return (
      <section
        className="mt-10 p-6 bg-white rounded-lg border border-gray-200"
        role="alert"
      >
        <h2>PROPERTY PRICING</h2>
        <p>
          Property pricing is temporarily unavailable. Please reload to try
          again.
        </p>
      </section>
    );
  }
  return <PropertyPricingTable key={gameId} table={table} />;
}
