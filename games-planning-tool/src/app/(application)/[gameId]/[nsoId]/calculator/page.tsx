// 10% ai generated code
import { notFound } from 'next/navigation';
import CalculatorClient from '@/features/nso-calculator/components/CalculatorClient';
import { getCalculatorData } from '@/lib/calculator';

type CalculatorPageProps = {
  params: Promise<{
    gameId: string;
    nsoId: string;
  }>;
};

export default async function CalculatorPage({
  params,
}: CalculatorPageProps) {
  const { gameId, nsoId } = await params;

  const parsedGameId = Number(gameId);
  const isValidGameId =
    Number.isSafeInteger(parsedGameId) && parsedGameId > 0;

  const isValidNsoId =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      nsoId,
    );

  // mock routes until auth is implemented
  if (!isValidGameId || !isValidNsoId) {
    return <CalculatorClient />;
  }

  const calculatorData = await getCalculatorData(
    parsedGameId,
    nsoId,
  );

  if (!calculatorData) {
    notFound();
  }

  return (
    <CalculatorClient
      key={`${gameId}-${nsoId}`}
      initialData={calculatorData}
    />
  );
}