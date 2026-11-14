// AI contribution: 100% AI-generated
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const draftActions = vi.hoisted(() => ({
  saveDraftDocument: vi.fn(),
  deleteDraftDocument: vi.fn(),
}));

vi.mock('@/lib/draft-actions', () => draftActions);

import NotesBox from '@/components/commons/NotesBox';

describe('NotesBox draft persistence', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    draftActions.saveDraftDocument.mockResolvedValue(undefined);
    draftActions.deleteDraftDocument.mockResolvedValue(undefined);
  });

  it('saves the canonical value then clears its persisted draft', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(
      <NotesBox
        id="notes"
        value="saved note"
        initialDraft="restored note"
        draftKey="notes:test"
        onSave={onSave}
      />,
    );

    expect(screen.getByText('Draft restored')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Notes'), {
      target: { value: 'final note' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(onSave).toHaveBeenCalledWith('final note'));
    expect(draftActions.saveDraftDocument).toHaveBeenCalledWith(
      'notes:test',
      { notes: 'final note' },
      1,
    );
    expect(draftActions.deleteDraftDocument).toHaveBeenCalledWith('notes:test');
  });

  it('keeps the note and draft when the canonical save fails', async () => {
    const onSave = vi.fn().mockRejectedValue(new Error('save failed'));
    render(
      <NotesBox
        id="notes"
        value="saved note"
        draftKey="notes:test"
        onSave={onSave}
      />,
    );

    fireEvent.change(screen.getByLabelText('Notes'), {
      target: { value: 'unfinished note' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Save failed');
    expect(screen.getByLabelText('Notes')).toHaveValue('unfinished note');
    expect(draftActions.deleteDraftDocument).not.toHaveBeenCalled();
  });

  it('confirms discard and deletes the draft before restoring canonical notes', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(
      <NotesBox
        id="notes"
        value="canonical note"
        initialDraft="restored note"
        draftKey="notes:test"
        onSave={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText('Notes'), {
      target: { value: 'edited note' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Discard draft' }));

    expect(confirmSpy).toHaveBeenCalled();
    await waitFor(() =>
      expect(draftActions.deleteDraftDocument).toHaveBeenCalledWith(
        'notes:test',
      ),
    );
    expect(screen.getByLabelText('Notes')).toHaveValue('canonical note');
    confirmSpy.mockRestore();
  });
});
