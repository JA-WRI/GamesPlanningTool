// AI usage -> 100%
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TeamStatusCard from '../../../src/components/coc-admin-dashboard/TeamStatusCard';
import type { Status } from '../../../src/components/coc-admin-dashboard/status';

const columns: { title: string; status: Status; href: string }[] = [
  { title: 'Team Size', status: 'Submitted', href: '/team-size' },
  { title: 'Accreditation', status: 'Completed', href: '/accreditation' },
  { title: 'Arrival/Travel In', status: 'Requires Update', href: '/arrival' },
  { title: 'Departure/Travel Out', status: 'In Progress', href: '/departure' },
  { title: 'Review and Completion', status: 'Not Started', href: '/review' },
];

function renderCard(overrides = {}) {
  return render(
    <TeamStatusCard
      teamName="Badminton Canada"
      logo="/logos/badminton.png"
      columns={columns}
      {...overrides}
    />,
  );
}

describe('TeamStatusCard', () => {
  it('renders the team logo with the team name as alt text', () => {
    renderCard();

    expect(screen.getByAltText('Badminton Canada')).toBeInTheDocument();
  });

  it('renders a title for every column', () => {
    renderCard();

    columns.forEach((col) => {
      expect(screen.getByText(col.title)).toBeInTheDocument();
    });
  });

  it('renders the status for every column', () => {
    renderCard();

    columns.forEach((col) => {
      expect(screen.getByText(col.status)).toBeInTheDocument();
    });
  });

  it('renders one "View Detail" link per column', () => {
    renderCard();

    expect(screen.getAllByRole('link', { name: 'View Detail' })).toHaveLength(
      columns.length,
    );
  });

  it('points each link at its column href', () => {
    renderCard();

    const links = screen.getAllByRole('link', { name: 'View Detail' });

    links.forEach((link, i) => {
      expect(link).toHaveAttribute('href', columns[i].href);
    });
  });

  it('renders no columns when the list is empty', () => {
    renderCard({ columns: [] });

    expect(screen.getByAltText('Badminton Canada')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('shows the same status in more than one column', () => {
    renderCard({
      columns: [
        { title: 'Team Size', status: 'Not Started', href: '/a' },
        { title: 'Accreditation', status: 'Not Started', href: '/b' },
      ],
    });

    expect(screen.getAllByText('Not Started')).toHaveLength(2);
  });
});
