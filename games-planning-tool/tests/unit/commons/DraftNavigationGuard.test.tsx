// AI contribution: 100% AI-generated
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  flushActiveDrafts: vi.fn(),
  hasUnsavedDraftChanges: vi.fn(),
}));

vi.mock('@/lib/draft-navigation', () => ({
  flushActiveDrafts: mocks.flushActiveDrafts,
  hasUnsavedDraftChanges: mocks.hasUnsavedDraftChanges,
}));

import DraftNavigationGuard from '@/components/commons/DraftNavigationGuard';

function appendAnchor(container: HTMLElement, href: string): HTMLAnchorElement {
  const anchor = document.createElement('a');
  anchor.href = href;
  container.append(anchor);
  return anchor;
}

describe('DraftNavigationGuard', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.flushActiveDrafts.mockResolvedValue(undefined);
    mocks.hasUnsavedDraftChanges.mockReturnValue(true);
  });

  it('flushes active drafts before navigating to an internal link', async () => {
    const { container } = render(<DraftNavigationGuard />);
    const link = appendAnchor(container, '/10/resources?tab=files');
    const observedDefault = vi.fn();
    const handleLink = vi.fn((event: Event) => {
      observedDefault(event.defaultPrevented);
      event.preventDefault();
    });
    link.addEventListener('click', handleLink);
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });

    link.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    await waitFor(() => expect(handleLink).toHaveBeenCalledOnce());
    expect(observedDefault.mock.calls).toEqual([[false]]);
    expect(mocks.flushActiveDrafts).toHaveBeenCalledOnce();
  });

  it('leaves clean links to their original click handler', () => {
    mocks.hasUnsavedDraftChanges.mockReturnValue(false);
    const { container } = render(<DraftNavigationGuard />);
    const link = appendAnchor(container, '/10/resources');
    const observed = vi.fn((event: Event) => {
      expect(event.defaultPrevented).toBe(false);
      event.preventDefault();
    });
    link.addEventListener('click', observed);
    fireEvent.click(link);
    expect(observed).toHaveBeenCalledOnce();
    expect(mocks.flushActiveDrafts).not.toHaveBeenCalled();
  });

  it('does not intercept modified clicks or external links', () => {
    const { container } = render(<DraftNavigationGuard />);
    const externalLink = appendAnchor(container, 'https://example.com');
    const internalLink = appendAnchor(container, '/10/other');
    const preventDefault = (event: Event) => event.preventDefault();
    document.addEventListener('click', preventDefault);

    fireEvent.click(externalLink);
    fireEvent.click(internalLink, { ctrlKey: true });

    document.removeEventListener('click', preventDefault);
    expect(mocks.flushActiveDrafts).not.toHaveBeenCalled();
  });

  it('asks before leaving when a draft flush fails', async () => {
    mocks.flushActiveDrafts.mockRejectedValue(new Error('offline'));
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const { container } = render(<DraftNavigationGuard />);
    const link = appendAnchor(container, '/10/resources');

    fireEvent.click(link);

    await waitFor(() => expect(confirmSpy).toHaveBeenCalled());
    confirmSpy.mockRestore();
  });

  it('asks before leaving when draft saving times out', async () => {
    vi.useFakeTimers();
    mocks.flushActiveDrafts.mockReturnValue(new Promise<void>(() => {}));
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const { container } = render(<DraftNavigationGuard />);
    const link = appendAnchor(container, '/10/resources');

    fireEvent.click(link);

    await vi.advanceTimersByTimeAsync(10000);

    expect(confirmSpy).toHaveBeenCalledWith(
      'Your draft could not be saved. Leave this page and risk losing recent edits?',
    );
    confirmSpy.mockRestore();
  });

  it('resumes the original link once when the user accepts a failed flush', async () => {
    mocks.flushActiveDrafts.mockRejectedValue(new Error('offline'));
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const { container } = render(<DraftNavigationGuard />);
    const link = appendAnchor(container, '/10/resources');
    const onClick = vi.fn((event: Event) => event.preventDefault());
    link.addEventListener('click', onClick);

    fireEvent.click(link);

    await waitFor(() => expect(onClick).toHaveBeenCalledOnce());
    expect(confirmSpy).toHaveBeenCalledOnce();
    confirmSpy.mockRestore();
  });

  it('warns on page unload only when edits are not yet saved', () => {
    render(<DraftNavigationGuard />);
    const dirty = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(dirty);
    expect(dirty.defaultPrevented).toBe(true);
    mocks.hasUnsavedDraftChanges.mockReturnValue(false);
    const clean = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(clean);
    expect(clean.defaultPrevented).toBe(false);
  });
});
