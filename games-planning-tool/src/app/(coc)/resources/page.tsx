import React from 'react';
import { Topbar } from '@/components/layout/topbar';
import { Navbar } from '@/components/layout/navbar';
import { ResourcesPageContent } from '@/components/resources/ResourcesPageContent';

export const metadata = {
  title: 'Resources | Games Planning Tool',
  description:
    'Manage and view games planning resources, documents, policies, and guidelines.',
};

export default function ResourcesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fa]">
      <Topbar currentGames="LA 2028" />
      <Navbar />
      <ResourcesPageContent />
    </div>
  );
}
