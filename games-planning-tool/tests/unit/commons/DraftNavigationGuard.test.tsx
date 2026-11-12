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

function appendAnchor(container: HTMLElement, href: string): HTMLAnchorElement {
  const anchor = document.createElement('a');
  anchor.href = href;
  container.append(anchor);
  return anchor;
}

describe('DraftNavigationGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.flushActiveDrafts.mockResolvedValue(undefined);
  });

  it('flushes active drafts before navigating to an internal link', async () => {
    const { container } = render(<DraftNavigationGuard />);
    const link = appendAnchor(container, '/10/resources?tab=files');
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });

    link.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    await waitFor(() =>
      expect(mocks.push).toHaveBeenCalledWith('/10/resources?tab=files'),
    );
    expect(mocks.flushActiveDrafts).toHaveBeenCalledOnce();
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
    expect(mocks.push).not.toHaveBeenCalled();
  });

  it('asks before leaving when a draft flush fails', async () => {
    mocks.flushActiveDrafts.mockRejectedValue(new Error('offline'));
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const { container } = render(<DraftNavigationGuard />);
    const link = appendAnchor(container, '/10/resources');

    fireEvent.click(link);

    await waitFor(() => expect(confirmSpy).toHaveBeenCalled());
    expect(mocks.push).not.toHaveBeenCalled();
    confirmSpy.mockRestore();
  });
});
