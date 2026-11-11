// AI contribution: 100% AI-generated
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const draftActions = vi.hoisted(() => ({
  saveDraftDocument: vi.fn(),
  deleteDraftDocument: vi.fn(),
}));

vi.mock('@/lib/draft-actions', () => draftActions);

import { useDraftAutosave } from '@/hooks/useDraftAutosave';

describe('useDraftAutosave', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    draftActions.saveDraftDocument.mockResolvedValue(undefined);
    draftActions.deleteDraftDocument.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('debounces changes and persists the latest snapshot', async () => {
    const onPersist = vi.fn();
    const { rerender, result } = renderHook(
      ({ value }) =>
        useDraftAutosave({
          draftKey: 'test:grid',
          value,
          enabled: true,
          debounceMs: 200,
          onPersist,
        }),
      { initialProps: { value: [{ id: 'one', name: 'Initial' }] } },
    );

    rerender({ value: [{ id: 'one', name: 'Edited' }] });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(199);
    });
    expect(draftActions.saveDraftDocument).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });

    expect(draftActions.saveDraftDocument).toHaveBeenCalledWith(
      'test:grid',
      [{ id: 'one', name: 'Edited' }],
      1,
    );
    expect(onPersist).toHaveBeenCalledWith([{ id: 'one', name: 'Edited' }]);
    expect(result.current.status).toBe('saved');
  });

  it('flushes immediately and clears after the canonical save', async () => {
    const { result } = renderHook(() =>
      useDraftAutosave({
        draftKey: 'test:grid',
        value: [{ id: 'one', name: 'Initial' }],
        enabled: false,
        initiallyRestored: true,
      }),
    );
    const snapshot = [{ id: 'one', name: 'Edited' }];

    await act(async () => {
      await result.current.flush(snapshot);
      await result.current.clear('committed');
    });

    expect(draftActions.saveDraftDocument).toHaveBeenCalledWith(
      'test:grid',
      snapshot,
      1,
    );
    expect(draftActions.deleteDraftDocument).toHaveBeenCalledWith('test:grid');
    expect(result.current.hasPersistedDraft).toBe(false);
    expect(result.current.status).toBe('committed');
  });

  it('starts in restored state when a draft was loaded from the database', () => {
    const { result } = renderHook(() =>
      useDraftAutosave({
        draftKey: 'test:grid',
        value: [{ id: 'one', name: 'Draft' }],
        enabled: false,
        initiallyRestored: true,
      }),
    );

    expect(result.current.status).toBe('restored');
    expect(result.current.hasPersistedDraft).toBe(true);
  });
});
