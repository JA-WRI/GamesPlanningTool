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
    expect(
      screen.queryByRole('link', { name: 'Manage Resources' }),
    ).not.toBeInTheDocument();

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

  it('handles empty state and renders Manage Resources for overview', () => {
    vi.mocked(resourcesData.getCachedResources).mockReturnValue([]);
    render(<DashboardResourceRow gameId="game_id_1" />);
    expect(
      screen.getByText('No resources available for this dashboard.'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Manage Resources' }),
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

    const windowOpenSpy = vi
      .spyOn(window, 'open')
      .mockImplementation(() => null);
    const file = screen.getByRole('button', { name: 'Summer File' });
    fireEvent.click(file);
    expect(windowOpenSpy).toHaveBeenCalledWith(
      'test',
      '_blank',
      'noopener,noreferrer',
    );
    windowOpenSpy.mockRestore();
  });

  it('handles link resource clicks and opening detail modal from folder child', () => {
    const childFile: Resource = {
      id: 'child-file',
      name: 'Child File',
      type: 'file',
      fileUrl: 'child-url',
      parentId: 'folder-1',
      categories: ['General'],
    };
    const mockResources: Resource[] = [
      {
        id: 'folder-1',
        name: 'General Folder',
        type: 'folder',
        categories: ['General'],
      },
      {
        id: 'link-1',
        name: 'Useful Link',
        type: 'link',
        URL: 'https://example.com',
        categories: ['General'],
      },
      childFile,
    ];

    vi.mocked(resourcesData.getCachedResources).mockReturnValue(mockResources);
    vi.mocked(resourcesData.getFolderChildren).mockReturnValue([childFile]);

    render(<DashboardResourceRow gameId="game_id_1" />);

    const windowOpenSpy = vi
      .spyOn(window, 'open')
      .mockImplementation(() => null);

    const link = screen.getByRole('button', { name: 'Useful Link' });
    fireEvent.click(link);
    expect(windowOpenSpy).toHaveBeenCalledWith(
      'https://example.com',
      '_blank',
      'noopener,noreferrer',
    );

    // Click folder to open directory modal
    fireEvent.click(screen.getByText('General Folder'));
    expect(screen.getByText('Child File')).toBeInTheDocument();

    // Click child file inside folder to open file URL
    fireEvent.click(screen.getByRole('button', { name: 'Child File' }));
    expect(windowOpenSpy).toHaveBeenCalledWith(
      'child-url',
      '_blank',
      'noopener,noreferrer',
    );

    // Close folder modal
    const closeFolderBtn = screen.getByRole('button', {
      name: 'Close folder dialog',
    });
    fireEvent.click(closeFolderBtn);

    windowOpenSpy.mockRestore();
  });
});
