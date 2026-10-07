// Made with AI agents (Antigravity)
import React from 'react';
import { ResourcesPageContent } from '@/components/resources/ResourcesPageContent';

export const metadata = {
  title: 'Resource Management | Games Planning Tool',
  description:
    'Manage and view games planning resources, documents, policies, and guidelines.',
};

export default function ResourceManagementPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fa]">
      <ResourcesPageContent />
    </div>
  );
}
