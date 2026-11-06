// Made with AI agents (Antigravity)
import React from 'react';
import { ResourcesPageContent } from '@/features/resources/components/ResourcesPageContent';
import { listResources } from '@/lib/resources';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Resources | Games Planning Tool',
  description:
    'Manage and view games planning resources, documents, policies, and guidelines.',
};

export default async function ResourcesPage() {
  const resources = await listResources();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <ResourcesPageContent initialResources={resources} isReadOnly={true} />
    </div>
  );
}
