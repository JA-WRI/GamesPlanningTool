//50% or more AI-generated
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Users } from 'lucide-react';
import StatCard from '../../../src/app/(application)/[gameId]/(coc)/dashboard/StatCard';

describe('StatCard', () => {
  it('renders the label, value, and description', () => {
    render(
      <StatCard
        icon={Users}
        label="Total"
        value={7}
        description="NSOs tracked"
      />,
    );

    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('NSOs tracked')).toBeInTheDocument();
  });

  it('renders a string value such as a percentage', () => {
    render(
      <StatCard
        icon={Users}
        label="Avg"
        value="42%"
        description="Average completion"
      />,
    );

    expect(screen.getByText('42%')).toBeInTheDocument();
  });

  it('renders the provided icon', () => {
    const { container } = render(
      <StatCard icon={Users} label="Total" value={0} description="" />,
    );

    expect(container.querySelector('svg[aria-hidden="true"]')).toBeInTheDocument();
  });
});
