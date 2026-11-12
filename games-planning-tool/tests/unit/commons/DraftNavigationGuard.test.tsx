// AI contribution: 100% AI-generated
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  flushActiveDrafts: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mocks.push }),
}));
vi.mock('@/lib/draft-navigation', () => ({
  flushActiveDrafts: mocks.flushActiveDrafts,
}));

import DraftNavigationGuard from '@/components/commons/DraftNavigationGuard';

describe('DraftNavigationGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.flushActiveDrafts.mockResolvedValue(undefined);
  });

  it('flushes active drafts before navigating to an internal link', async () => {
    render(
      <>
        <DraftNavigationGuard />
        <a href="/10/resources?tab=files">Resources</a>
      </>,
    );
    const link = document.querySelector('a')!;
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });

    link.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    await waitFor(() =>
      expect(mocks.push).toHaveBeenCalledWith('/10/resources?tab=files'),
    );
    expect(mocks.flushActiveDrafts).toHaveBeenCalledOnce();
  });

  it('does not intercept modified clicks or external links', () => {
    render(
      <>
        <DraftNavigationGuard />
        <a href="https://example.com">External</a>
        <a href="/10/other">Modified</a>
      </>,
    );
    document.addEventListener('click', (event) => event.preventDefault());

    const externalEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
    });
    document
      .querySelector('a[href="https://example.com"]')!
      .dispatchEvent(externalEvent);
    const modifiedEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      ctrlKey: true,
    });
    document.querySelector('a[href="/10/other"]')!.dispatchEvent(modifiedEvent);

    expect(mocks.flushActiveDrafts).not.toHaveBeenCalled();
    expect(mocks.push).not.toHaveBeenCalled();
  });

  it('asks before leaving when a draft flush fails', async () => {
    mocks.flushActiveDrafts.mockRejectedValue(new Error('offline'));
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    render(
      <>
        <DraftNavigationGuard />
        <a href="/10/resources">Resources</a>
      </>,
    );

    fireEvent.click(document.querySelector('a')!);

    await waitFor(() => expect(confirmSpy).toHaveBeenCalled());
    expect(mocks.push).not.toHaveBeenCalled();
    confirmSpy.mockRestore();
  });
});
