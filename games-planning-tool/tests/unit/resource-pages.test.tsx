// Made with AI agents (Antigravity)
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import ResourcesPage from '@/app/(application)/[gameId]/[nsoId]/resources/page';
import ResourceManagementPage from '@/app/(application)/admin/resource-management/page';

describe('Resource Page Wrappers', () => {
  it('renders NSO ResourcesPage', () => {
    render(<ResourcesPage />);
    expect(screen.getByText('Resources Dashboard')).toBeInTheDocument();
  });

  it('renders Admin ResourceManagementPage', () => {
    render(<ResourceManagementPage />);
    expect(screen.getByText('Resources Dashboard')).toBeInTheDocument();
  });
});
