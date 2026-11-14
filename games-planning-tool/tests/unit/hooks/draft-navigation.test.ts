import { describe, expect, it, vi } from 'vitest';
import {
  flushActiveDrafts,
  registerDraftFlusher,
} from '@/lib/draft-navigation';

describe('draft navigation flush', () => {
  it('awaits every registered draft before navigation', async () => {
    const first = vi.fn().mockResolvedValue(undefined);
    const second = vi.fn().mockResolvedValue(undefined);
    const unregisterFirst = registerDraftFlusher(first);
    const unregisterSecond = registerDraftFlusher(second);

    await flushActiveDrafts();

    expect(first).toHaveBeenCalledOnce();
    expect(second).toHaveBeenCalledOnce();
    unregisterFirst();
    unregisterSecond();
  });

  it('removes a draft flusher after it unregisters', async () => {
    const flush = vi.fn().mockResolvedValue(undefined);
    const unregister = registerDraftFlusher(flush);
    unregister();

    await flushActiveDrafts();

    expect(flush).not.toHaveBeenCalled();
  });
});
