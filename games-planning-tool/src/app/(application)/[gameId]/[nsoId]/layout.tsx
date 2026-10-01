import { notFound } from 'next/navigation';
import { Nsos } from '@/lib/data';

export default async function NsoLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ nsoId: string }>;
}) {
  const { nsoId } = await params;
  if (!Nsos.some((n) => n.id === nsoId)) notFound();
  return <>{children}</>;
}
