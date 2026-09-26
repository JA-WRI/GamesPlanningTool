import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { ResourceDetailModal } from '@/components/resources/ResourceDetailModal';
import { LinkResource, FileResource } from '@/types/resource';

describe('ResourceDetailModal', () => {
  it('does not render when resource is null', () => {
    const { container } = render(
      <ResourceDetailModal resource={null} onClose={() => {}} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders link resource details, handles close button click', () => {
    const handleClose = vi.fn();
    const link: LinkResource = {
      id: 'res-link',
      name: 'Olympic Rules',
      type: 'link',
      URL: 'https://olympics.com/rules',
      categories: ['Winter Games', 'General'],
    };

    render(<ResourceDetailModal resource={link} onClose={handleClose} />);

    expect(screen.getByText('Olympic Rules')).toBeInTheDocument();
    expect(screen.getByText('External Link')).toBeInTheDocument();
    expect(screen.getByText('https://olympics.com/rules')).toBeInTheDocument();

    const openLink = screen.getByRole('link', { name: /Open Link/i });
    expect(openLink).toHaveAttribute('href', 'https://olympics.com/rules');

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('renders file resource details and download button', () => {
    const fileRes: FileResource = {
      id: 'res-file',
      name: 'Team Manual',
      type: 'file',
      categories: ['Summer Games'],
      file: {
        name: 'manual.pdf',
        size: 2097152,
        type: 'application/pdf',
      },
      fileUrl: 'blob:mock-file-url',
    };

    render(<ResourceDetailModal resource={fileRes} onClose={() => {}} />);

    expect(screen.getByText('Team Manual')).toBeInTheDocument();
    expect(screen.getByText('Document File')).toBeInTheDocument();
    expect(screen.getByText('manual.pdf')).toBeInTheDocument();
    expect(screen.getByText(/2.00 MB/)).toBeInTheDocument();

    const downloadLink = screen.getByRole('link', { name: /Download File/i });
    expect(downloadLink).toHaveAttribute('href', 'blob:mock-file-url');
  });
});
