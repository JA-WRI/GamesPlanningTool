//  More than 50% AI Generated Code
import '@testing-library/jest-dom/vitest';
import { render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  SETTINGS_SECTIONS,
  type SectionCompletion,
} from '@/lib/system-settings-sections';

const { useSelectedLayoutSegment } = vi.hoisted(() => ({
  useSelectedLayoutSegment: vi.fn<() => string | null>(),
}));
vi.mock('next/navigation', () => ({ useSelectedLayoutSegment }));

import SettingsStepper from '@/components/system-settings/SettingsStepper';

function completion(complete: string[] = []): SectionCompletion {
  return Object.fromEntries(
    SETTINGS_SECTIONS.map((s) => [s.key, complete.includes(s.key)]),
  ) as SectionCompletion;
}

function linkFor(label: string) {
  return screen.getByRole('link', { name: new RegExp(`\\d+\\. ${label}`) });
}

describe('SettingsStepper', () => {
  beforeEach(() => {
    useSelectedLayoutSegment.mockReturnValue('properties');
  });

  it('links every section to its page for this Game, in order', () => {
    render(<SettingsStepper gameId={8} completion={completion()} />);
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(SETTINGS_SECTIONS.length);
    SETTINGS_SECTIONS.forEach((section, i) => {
      expect(links[i]).toHaveAttribute(
        'href',
        `/admin/system-settings/8/${section.key}`,
      );
      expect(links[i]).toHaveTextContent(`${i + 1}. ${section.label}`);
    });
  });

  it('shows a done mark only on complete sections', () => {
    render(
      <SettingsStepper gameId={8} completion={completion(['game-details'])} />,
    );
    expect(within(linkFor('Details')).getByText('Done')).toBeInTheDocument();
    expect(
      within(linkFor('NSOs')).getByText('Needs attention'),
    ).toBeInTheDocument();
  });

  it('shows how many sections are done', () => {
    render(
      <SettingsStepper
        gameId={8}
        completion={completion(['game-details', 'properties'])}
      />,
    );
    expect(
      screen.getByText(`2 of ${SETTINGS_SECTIONS.length} sections done`),
    ).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '2',
    );
  });

  it('marks the section in the URL as the current step', () => {
    render(<SettingsStepper gameId={8} completion={completion()} />);
    expect(linkFor('Properties & Prices')).toHaveAttribute(
      'aria-current',
      'step',
    );
    expect(linkFor('NSOs')).not.toHaveAttribute('aria-current');
  });
});
