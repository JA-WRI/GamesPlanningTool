// Made with AI agents (Antigravity)
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { DashboardResourceRow } from '@/components/resources/DashboardResourceRow';
import * as resourcesData from '@/lib/resources-data';
import { Resource } from '@/types/resource';

vi.mock('@/lib/resources-data', async () => {
  const actual = await vi.importActual('@/lib/resources-data');
  return {
    ...actual,
    subscribeToResources: vi.fn(),
    getCachedResources: vi.fn(),
    getFolderChildren: vi.fn(),
  };
});

describe('DashboardResourceRow', () => {
  beforeEach(() => {
    vi.mocked(resourcesData.subscribeToResources).mockImplementation(
      () => () => {},
    );
    vi.clearAllMocks();
  });

  it('renders resources and applies filters correctly based on viewerRole and NSO', () => {
    const mockResources: Resource[] = [
      {
        id: '1',
        name: 'General Folder',
        type: 'folder',
        categories: ['General'],
      },
      {
        id: '2',
        name: 'Summer File',
        type: 'file',
        fileUrl: 'test',
        categories: ['Summer Games'],
      },
      {
        id: '3',
        name: 'Winter File',
        type: 'file',
        fileUrl: 'test',
        categories: ['Winter Games'],
      },
      {
        id: '4',
        name: 'Admin Only File',
        type: 'file',
        fileUrl: 'test',
        categories: ['Badminton'],
      },
      {
        id: '5',
        name: 'Other NSO',
        type: 'file',
        fileUrl: 'test',
        categories: ['General', 'Alpine Canada'],
      },
    ];

    vi.mocked(resourcesData.getCachedResources).mockReturnValue(mockResources);
    vi.mocked(resourcesData.getFolderChildren).mockReturnValue([]);

    const { rerender } = render(
      <DashboardResourceRow
        gameId="game_id_1"
        nsoId="nso_1"
        viewerRole="nso"
      />,
    );

    expect(screen.getByText('General Folder')).toBeInTheDocument();
    expect(screen.getByText('Summer File')).toBeInTheDocument();
    expect(screen.queryByText('Winter File')).not.toBeInTheDocument();
    expect(screen.getByText('Admin Only File')).toBeInTheDocument();
    expect(screen.getByText('Other NSO')).toBeInTheDocument();

    rerender(
      <DashboardResourceRow
        gameId="game_id_2"
        nsoId="nso_2"
        viewerRole="admin"
      />,
    );
    expect(screen.queryByText('Summer File')).not.toBeInTheDocument();
    expect(screen.getByText('Winter File')).toBeInTheDocument();
  });

  it('handles empty state', () => {
    vi.mocked(resourcesData.getCachedResources).mockReturnValue([]);
    render(<DashboardResourceRow gameId="game_id_1" />);
    expect(
      screen.getByText('No resources available for this dashboard.'),
    ).toBeInTheDocument();
  });

  it('opens folder modal and detail modal on click', () => {
    const mockResources: Resource[] = [
      {
        id: 'folder-1',
        name: 'General Folder',
        type: 'folder',
        categories: ['General'],
      },
      {
        id: 'file-1',
        name: 'Summer File',
        type: 'file',
        fileUrl: 'test',
        categories: ['Summer Games'],
      },
    ];
    vi.mocked(resourcesData.getCachedResources).mockReturnValue(mockResources);
    vi.mocked(resourcesData.getFolderChildren).mockReturnValue([]);

    render(<DashboardResourceRow gameId="game_id_1" />);

    const folder = screen.getByText('General Folder');

    fireEvent.click(folder);
    expect(screen.getByText('This folder is empty.')).toBeInTheDocument();

    const file = screen.getByText('Summer File');
    fireEvent.click(file);
    // Detail modal should appear, which includes a download button for files
    expect(screen.getByText('Download File')).toBeInTheDocument();
  });
});
