//  More than 50% AI Generated Code
import '@testing-library/jest-dom/vitest';
import { useState } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import UnsavedChangesGuard from '@/components/system-settings/UnsavedChangesGuard';
import SettingsSectionCard from '@/components/system-settings/SettingsSectionCard';

// A step with one field. Typing makes it dirty; Cancel restores "saved".
function Step({ onDiscardSpy }: { onDiscardSpy?: () => void }) {
  const [value, setValue] = useState('saved');
  return (
    <SettingsSectionCard
      title="Game Details"
      isDirty={value !== 'saved'}
      onSave={() => {}}
      onCancel={() => {
        onDiscardSpy?.();
        setValue('saved');
      }}
    >
      <input
        aria-label="Name"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </SettingsSectionCard>
  );
}

// Renders the guard with a step and a link that leaves it. The link's own
// click handler stands in for Next's <Link> navigating.
function setup(onDiscardSpy?: () => void) {
  const navigate = vi.fn((event: React.MouseEvent) => event.preventDefault());
  render(
    <UnsavedChangesGuard>
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- stands in for <Link>, which needs a router */}
      <a href="/admin/system-settings/8/properties" onClick={navigate}>
        Properties
      </a>
      <Step onDiscardSpy={onDiscardSpy} />
    </UnsavedChangesGuard>,
  );
  return { navigate, link: screen.getByText('Properties') };
}

const dialogTitle = 'You have unsaved changes';

describe('UnsavedChangesGuard', () => {
  it('lets the Admin leave a step with no unsaved changes', () => {
    const { navigate, link } = setup();
    fireEvent.click(link);
    expect(navigate).toHaveBeenCalledOnce();
    expect(screen.queryByText(dialogTitle)).not.toBeInTheDocument();
  });

  it('asks before leaving a step with unsaved changes', () => {
    const { navigate, link } = setup();
    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'edited' },
    });
    fireEvent.click(link);
    expect(navigate).not.toHaveBeenCalled();
    expect(screen.getByText(dialogTitle)).toBeInTheDocument();
  });

  it('Keep editing stays on the step and keeps the changes', async () => {
    const { navigate, link } = setup();
    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'edited' },
    });
    fireEvent.click(link);
    fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));

    await waitFor(() =>
      expect(screen.queryByText(dialogTitle)).not.toBeInTheDocument(),
    );
    expect(navigate).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Name')).toHaveValue('edited');
  });

  it('Discard changes restores the saved values and continues', () => {
    const onDiscard = vi.fn();
    const { navigate, link } = setup(onDiscard);
    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'edited' },
    });
    fireEvent.click(link);
    fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));

    expect(onDiscard).toHaveBeenCalledOnce();
    expect(navigate).toHaveBeenCalledOnce();
    expect(screen.getByLabelText('Name')).toHaveValue('saved');
  });

  it('stops asking once the changes are cancelled', () => {
    const { navigate, link } = setup();
    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'edited' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    fireEvent.click(link);
    expect(navigate).toHaveBeenCalledOnce();
    expect(screen.queryByText(dialogTitle)).not.toBeInTheDocument();
  });

  it('asks the browser to confirm a reload only with unsaved changes', () => {
    setup();
    const clean = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(clean);
    expect(clean.defaultPrevented).toBe(false);

    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'edited' },
    });
    const dirty = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(dirty);
    expect(dirty.defaultPrevented).toBe(true);
  });
});

// Clicks the guard should leave alone, even with unsaved changes.
describe('UnsavedChangesGuard: clicks it lets through', () => {
  function renderDirty(link: React.ReactNode) {
    render(
      <UnsavedChangesGuard>
        {link}
        <Step />
      </UnsavedChangesGuard>,
    );
    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'edited' },
    });
  }

  const noNavigation = (event: React.MouseEvent) => event.preventDefault();

  it.each([
    ['Ctrl', { ctrlKey: true }],
    ['Cmd', { metaKey: true }],
    ['Shift', { shiftKey: true }],
  ])('does not ask on a %s-click (opens a new tab or window)', (_key, keys) => {
    renderDirty(
      // eslint-disable-next-line @next/next/no-html-link-for-pages -- plain link on purpose
      <a href="/admin/system-settings/8/properties" onClick={noNavigation}>
        Properties
      </a>,
    );
    fireEvent.click(screen.getByText('Properties'), keys);
    expect(screen.queryByText(dialogTitle)).not.toBeInTheDocument();
  });

  it('does not ask for links to other sites', () => {
    renderDirty(
      <a href="https://example.com/help" onClick={noNavigation}>
        Help
      </a>,
    );
    fireEvent.click(screen.getByText('Help'));
    expect(screen.queryByText(dialogTitle)).not.toBeInTheDocument();
  });

  it('does not ask for links to the page already open', () => {
    renderDirty(
      <a href={window.location.pathname} onClick={noNavigation}>
        This page
      </a>,
    );
    fireEvent.click(screen.getByText('This page'));
    expect(screen.queryByText(dialogTitle)).not.toBeInTheDocument();
  });

  it('does not ask for clicks outside any link', () => {
    renderDirty(null);
    fireEvent.click(screen.getByLabelText('Name'));
    fireEvent.click(document);
    expect(screen.queryByText(dialogTitle)).not.toBeInTheDocument();
  });

  it('discards without navigating if the link is gone by then', () => {
    // A plain DOM link React doesn't manage, so the test can remove it
    const navigate = vi.fn((event: Event) => event.preventDefault());
    renderDirty(null);
    const link = document.createElement('a');
    link.href = '/admin/system-settings/8/properties';
    link.addEventListener('click', navigate);
    document.body.append(link);

    fireEvent.click(link);
    link.remove();
    fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));

    expect(navigate).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Name')).toHaveValue('saved');
  });
});
