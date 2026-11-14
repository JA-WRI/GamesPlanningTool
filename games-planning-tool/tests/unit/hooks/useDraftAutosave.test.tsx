// AI contribution: 100% AI-generated
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const draftActions = vi.hoisted(() => ({
  saveDraftDocument: vi.fn(),
  deleteDraftDocument: vi.fn(),
}));

vi.mock('@/lib/draft-actions', () => draftActions);

import { useDraftAutosave } from '@/hooks/useDraftAutosave';
import { flushActiveDrafts } from '@/lib/draft-navigation';

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

  it('does not save or flush invalid edits, and resumes after correction', async () => {
    const { rerender } = renderHook(
      ({ value, canPersist }) =>
        useDraftAutosave({
          draftKey: 'test:grid',
          value,
          enabled: true,
          canPersist,
          debounceMs: 200,
        }),
      { initialProps: { value: '123', canPersist: true } },
    );

    rerender({ value: '12x', canPersist: false });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });

    expect(draftActions.saveDraftDocument).not.toHaveBeenCalled();
    await expect(flushActiveDrafts()).rejects.toThrow(
      'Fix invalid inputs before saving the draft.',
    );
    expect(draftActions.saveDraftDocument).not.toHaveBeenCalled();

    rerender({ value: '0123', canPersist: true });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(200);
    });
    expect(draftActions.saveDraftDocument).toHaveBeenCalledWith(
      'test:grid',
      '0123',
      1,
    );
  });

  it('keeps invalid edits pending when an earlier valid save finishes', async () => {
    let finishSave!: () => void;
    draftActions.saveDraftDocument.mockReturnValueOnce(
      new Promise<void>((resolve) => {
        finishSave = resolve;
      }),
    );
    const { rerender, result } = renderHook(
      ({ value, canPersist }) =>
        useDraftAutosave({
          draftKey: 'test:grid',
          value,
          enabled: true,
          canPersist,
          debounceMs: 200,
          initiallyRestored: true,
        }),
      { initialProps: { value: '123', canPersist: true } },
    );

    rerender({ value: '456', canPersist: true });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(200);
    });
    expect(draftActions.saveDraftDocument).toHaveBeenCalledWith(
      'test:grid',
      '456',
      1,
    );
    rerender({ value: '456x', canPersist: false });
    await act(async () => {
      finishSave();
      await vi.advanceTimersByTimeAsync(300);
    });

    expect(draftActions.saveDraftDocument).toHaveBeenCalledTimes(1);
    expect(draftActions.deleteDraftDocument).not.toHaveBeenCalled();
    expect(result.current.hasPersistedDraft).toBe(true);
    expect(result.current.isSaving).toBe(false);
    expect(result.current.isPending).toBe(true);
    await expect(flushActiveDrafts()).rejects.toThrow(
      'Fix invalid inputs before saving the draft.',
    );
  });
});
