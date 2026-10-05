// Made with AI agents (Antigravity)

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { ResourceDetailModal } from '@/components/resources/ResourceDetailModal';
import { FileResource } from '@/types/resource';

describe('ResourceDetailModal', () => {
  const mockFile: FileResource = {
    id: 'file-1',
    name: 'Old Name',
    type: 'file',
    file: {
      name: 'test.pdf',
      size: 1048576,
      type: 'application/pdf',
      lastModified: 0,
    },
    fileUrl: 'blob:test',
    previewUrl: 'test-preview',
    categories: ['Winter'],
  };

  it('handles rename logic', () => {
    const handleRename = vi.fn();
    render(
      <ResourceDetailModal
        resource={mockFile}
        onClose={vi.fn()}
        onRename={handleRename}
      />
    );

    // Click to rename
    const title = screen.getByText('Old Name');
    fireEvent.click(title);

    // Find input and change value
    const input = screen.getByDisplayValue('Old Name');
    fireEvent.change(input, { target: { value: 'New Name' } });
    
    // Press Enter to save
    fireEvent.keyDown(input, { key: 'Enter' });
    
    expect(handleRename).toHaveBeenCalledWith('file-1', 'New Name');
  });

  it('cancels rename logic on Escape', () => {
    render(
      <ResourceDetailModal
        resource={mockFile}
        onClose={vi.fn()}
        onRename={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText('Old Name'));
    const input = screen.getByDisplayValue('Old Name');
    fireEvent.keyDown(input, { key: 'Escape' });
    
    // Input should be gone
    expect(screen.queryByDisplayValue('Old Name')).not.toBeInTheDocument();
  });
});
