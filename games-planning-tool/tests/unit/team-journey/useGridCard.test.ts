// AI contribution: 50% or more AI-generated
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGridCard } from '@/app/(application)/[gameId]/[nsoId]/team-journey/_components/useGridCard';

interface TestRow extends Record<string, unknown> {
  id: string;
  count: number;
}

const initialRows: TestRow[] = [{ id: '1', count: 5 }];
const createRow = (): TestRow => ({ id: '2', count: 0 });

// starts the hook with these rows and the note "first note"
function setup(isValid?: (rows: TestRow[]) => boolean) {
  const onSave = vi.fn();
  const hook = renderHook(() =>
    useGridCard<TestRow>({
      initialRows,
      initialNotes: 'first note',
      createRow,
      isValid,
      onSave,
    }),
  );
  return { ...hook, onSave };
}

describe('useGridCard', () => {
  it('turns on edit mode with edit()', () => {
    const { result } = setup();
    expect(result.current.isEditing).toBe(false);

    act(() => result.current.edit());

    expect(result.current.isEditing).toBe(true);
  });

  it('saves the rows and notes with onSave', () => {
    const { result, onSave } = setup();
    act(() => {
      result.current.edit();
      result.current.setRows([{ id: '1', count: 8 }]);
      result.current.setNotes('new note');
    });

    act(() => result.current.save());

    expect(onSave).toHaveBeenCalledWith([{ id: '1', count: 8 }], 'new note');
    expect(result.current.isEditing).toBe(false);
  });

  it('does not save when isValid returns false', () => {
    const { result, onSave } = setup((rows) => rows[0].count < 10);
    act(() => {
      result.current.edit();
      result.current.setRows([{ id: '1', count: 50 }]);
    });
    expect(result.current.canSave).toBe(false);

    act(() => result.current.save());

    expect(onSave).not.toHaveBeenCalled();
    expect(result.current.isEditing).toBe(true);
  });

  it('does not save when a grid cell has an error', () => {
    const { result, onSave } = setup();
    act(() => {
      result.current.edit();
      result.current.setHasCellError(true);
    });
    expect(result.current.canSave).toBe(false);

    act(() => result.current.save());

    expect(onSave).not.toHaveBeenCalled();
  });

  it('puts back the rows and notes on cancel', () => {
    const { result } = setup();
    act(() => {
      result.current.edit();
      result.current.setRows([{ id: '1', count: 99 }]);
      result.current.setNotes('changed');
    });

    act(() => result.current.cancel());

    expect(result.current.rows).toEqual(initialRows);
    expect(result.current.notes).toBe('first note');
    expect(result.current.isEditing).toBe(false);
  });

  it('puts back the saved notes, not the first ones, on cancel after a save', () => {
    const { result } = setup();
    act(() => {
      result.current.edit();
      result.current.setNotes('saved note');
    });
    act(() => result.current.save());
    act(() => {
      result.current.edit();
      result.current.setNotes('not saved');
    });

    act(() => result.current.cancel());

    expect(result.current.notes).toBe('saved note');
  });

  it('starts in Edit View, not Preview', () => {
    const { result } = setup();
    act(() => result.current.edit());

    expect(result.current.isPreview).toBe(false);
  });

  it('switches to Preview and back while editing', () => {
    const { result } = setup();
    act(() => {
      result.current.edit();
      result.current.setIsPreview(true);
    });
    expect(result.current.isPreview).toBe(true);
    expect(result.current.isEditing).toBe(true);

    act(() => result.current.setIsPreview(false));

    expect(result.current.isPreview).toBe(false);
  });

  it('leaves Preview after save and after cancel', () => {
    const { result } = setup();
    act(() => {
      result.current.edit();
      result.current.setIsPreview(true);
    });
    act(() => result.current.save());
    expect(result.current.isPreview).toBe(false);

    act(() => {
      result.current.edit();
      result.current.setIsPreview(true);
    });
    act(() => result.current.cancel());
    expect(result.current.isPreview).toBe(false);
  });
});
