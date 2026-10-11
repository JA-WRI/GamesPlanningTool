// Made with AI agents (Antigravity)
import React from 'react';
import { DashboardResourceRow } from '@/components/resources/DashboardResourceRow';

export default async function Page({
  params,
}: {
  params: Promise<{ gameId: string; nsoId: string }>;
}) {
  const { gameId, nsoId } = await params;

  return (
    <div className="p-8">
      <div>nso page</div>
      <div className="mt-8">
        <DashboardResourceRow gameId={gameId} nsoId={nsoId} />
      </div>
    </div>
  );
}
