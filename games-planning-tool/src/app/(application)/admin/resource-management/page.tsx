// 50% or more AI-generated
import React from 'react';
import { ResourcesPageContent } from '@/features/resources/components/ResourcesPageContent';
import { listResources } from '@/lib/resources';
import { getNsoCategories } from '@/server/queries/nsos';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Resource Management | Games Planning Tool',
  description:
    'Manage and view games planning resources, documents, policies, and guidelines.',
};

export default async function ResourceManagementPage() {
  const [resources, nsoCategories] = await Promise.all([
    listResources(),
    getNsoCategories(),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <ResourcesPageContent
        initialResources={resources}
        nsoCategories={nsoCategories}
      />
    </div>
  );
}
