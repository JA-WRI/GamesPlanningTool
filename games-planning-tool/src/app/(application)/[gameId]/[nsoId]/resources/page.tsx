// 50% or more AI-generated
import React from 'react';
import { ResourcesPageContent } from '@/features/resources/components/ResourcesPageContent';
import { listResources, resourceVisibilityFor } from '@/lib/resources';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Resources | Games Planning Tool',
  description:
    'Manage and view games planning resources, documents, policies, and guidelines.',
};

type ResourcesPageProps = {
  params: Promise<{
    gameId: string;
    nsoId: string;
  }>;
};

export default async function ResourcesPage({ params }: ResourcesPageProps) {
  const { gameId, nsoId } = await params;
  const resources = await listResources(resourceVisibilityFor(gameId, nsoId));

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <ResourcesPageContent initialResources={resources} isReadOnly={true} />
    </div>
  );
}
