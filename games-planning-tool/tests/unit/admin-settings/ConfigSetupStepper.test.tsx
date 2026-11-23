//  More than 50% AI Generated Code
import '@testing-library/jest-dom/vitest';
import { render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  CONFIG_SECTIONS,
  type SectionCompletion,
} from '@/lib/admin-config-sections';

const { useSelectedLayoutSegment } = vi.hoisted(() => ({
  useSelectedLayoutSegment: vi.fn<() => string | null>(),
}));
vi.mock('next/navigation', () => ({ useSelectedLayoutSegment }));

import ConfigSetupStepper from '@/components/admin-settings/ConfigSetupStepper';

function completion(complete: string[] = []): SectionCompletion {
  return Object.fromEntries(
    CONFIG_SECTIONS.map((s) => [s.key, complete.includes(s.key)]),
  ) as SectionCompletion;
}

function linkFor(label: string) {
  return screen.getByRole('link', { name: new RegExp(`\\d+\\. ${label}`) });
}

describe('ConfigSetupStepper', () => {
  beforeEach(() => {
    useSelectedLayoutSegment.mockReturnValue('properties');
  });

  it('links every section to its page for this Game, in order', () => {
    render(<ConfigSetupStepper gameId={8} completion={completion()} />);
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(CONFIG_SECTIONS.length);
    CONFIG_SECTIONS.forEach((section, i) => {
      expect(links[i]).toHaveAttribute(
        'href',
        `/admin/system-settings/8/${section.key}`,
      );
      expect(links[i]).toHaveTextContent(`${i + 1}. ${section.label}`);
    });
  });

  it('shows a done mark only on complete sections', () => {
    render(
      <ConfigSetupStepper
        gameId={8}
        completion={completion(['game-details'])}
      />,
    );
    expect(within(linkFor('Details')).getByText('Done')).toBeInTheDocument();
    expect(
      within(linkFor('NSOs')).getByText('Needs attention'),
    ).toBeInTheDocument();
  });

  it('shows how many sections are done', () => {
    render(
      <ConfigSetupStepper
        gameId={8}
        completion={completion(['game-details', 'properties'])}
      />,
    );
    expect(
      screen.getByText(`2 of ${CONFIG_SECTIONS.length} sections done`),
    ).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '2',
    );
  });

  it('marks the section in the URL as the current step', () => {
    render(<ConfigSetupStepper gameId={8} completion={completion()} />);
    expect(linkFor('Properties & Prices')).toHaveAttribute(
      'aria-current',
      'step',
    );
    expect(linkFor('NSOs')).not.toHaveAttribute('aria-current');
  });
});
