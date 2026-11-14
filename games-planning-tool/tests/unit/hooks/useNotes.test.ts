// AI contribution: 50% or more AI-generated
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNotes } from '@/hooks/useNotes';

// starts each test with a saved note and a fake save function
function setup() {
  const onSave = vi.fn();
  const hook = renderHook(() => useNotes('first note', onSave));
  return { ...hook, onSave };
}

describe('useNotes', () => {
  it('starts with the saved notes and no changes', () => {
    const { result } = setup();

    expect(result.current.draft).toBe('first note');
    expect(result.current.hasChanges).toBe(false);
    expect(result.current.justSaved).toBe(false);
  });

  it('has changes after typing', () => {
    const { result } = setup();

    act(() => result.current.change('new text'));

    expect(result.current.draft).toBe('new text');
    expect(result.current.hasChanges).toBe(true);
  });

  it('has no changes when the text is typed back to the saved one', () => {
    const { result } = setup();
    act(() => result.current.change('new text'));

    act(() => result.current.change('first note'));

    expect(result.current.hasChanges).toBe(false);
  });

  it('saves the draft with onSave and shows it was saved', async () => {
    const { result, onSave } = setup();
    act(() => result.current.change('new text'));

    await act(async () => result.current.save());

    expect(onSave).toHaveBeenCalledWith('new text');
    expect(result.current.hasChanges).toBe(false);
    expect(result.current.justSaved).toBe(true);
  });

  it('does not call onSave when nothing changed', async () => {
    const { result, onSave } = setup();

    await act(async () => result.current.save());

    expect(onSave).not.toHaveBeenCalled();
    expect(result.current.justSaved).toBe(false);
  });

  it('puts back the saved notes on discard', () => {
    const { result, onSave } = setup();
    act(() => result.current.change('not wanted'));

    act(() => result.current.discard());

    expect(result.current.draft).toBe('first note');
    expect(result.current.hasChanges).toBe(false);
    expect(onSave).not.toHaveBeenCalled();
  });

  it('puts back the last saved notes, not the first ones, on discard', async () => {
    const { result } = setup();
    act(() => result.current.change('saved note'));
    await act(async () => result.current.save());
    act(() => result.current.change('not saved'));

    act(() => result.current.discard());

    expect(result.current.draft).toBe('saved note');
  });

  it('hides the saved message when typing again', async () => {
    const { result } = setup();
    act(() => result.current.change('new text'));
    await act(async () => result.current.save());

    act(() => result.current.change('more text'));

    expect(result.current.justSaved).toBe(false);
  });

  it('keeps unsaved notes when the database callback rejects', async () => {
    const onSave = vi.fn().mockRejectedValue(new Error('save failed'));
    const { result } = renderHook(() => useNotes('first note', onSave));
    act(() => result.current.change('new text'));

    await act(async () => {
      await expect(result.current.save()).rejects.toThrow('save failed');
    });

    expect(result.current.draft).toBe('new text');
    expect(result.current.hasChanges).toBe(true);
    expect(result.current.justSaved).toBe(false);
  });
});
