// Made with AI agents (Antigravity)
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Page from '@/app/(application)/[gameId]/[nsoId]/dashboard/page';

describe('NSO Dashboard Page', () => {
  it('renders correctly', () => {
    render(<Page />);

    expect(screen.getByText('nso page')).toBeInTheDocument();
  });
});
