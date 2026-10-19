//50% or more AI-generated
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatusColumn from '../../../src/app/(application)/[gameId]/(coc)/dashboard/_components/StatusColumn';

describe('StatusColumn', () => {
  it('renders the status tag', () => {
    render(<StatusColumn status="Completed" href="/detail" />);

    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('links "View Detail" to the given href', () => {
    render(<StatusColumn status="Completed" href="/detail" />);

    expect(screen.getByRole('link', { name: 'View Detail' })).toHaveAttribute(
      'href',
      '/detail',
    );
  });
});
