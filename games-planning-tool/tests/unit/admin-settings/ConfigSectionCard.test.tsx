//  More than 50% AI Generated Code
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ConfigSectionCard from '@/components/admin-settings/ConfigSectionCard';

function renderCard(props: Partial<Parameters<typeof ConfigSectionCard>[0]>) {
  render(
    <ConfigSectionCard title="Game Details" {...props}>
      <p>Section content</p>
    </ConfigSectionCard>,
  );
  return {
    // Matches both "Save" and "Saving…"
    save: screen.getByRole('button', { name: /^sav/i }),
    cancel: screen.getByRole('button', { name: 'Cancel' }),
  };
}

describe('ConfigSectionCard', () => {
  it('shows the title, description and the section content', () => {
    renderCard({ description: 'Name, location and dates' });
    expect(
      screen.getByRole('heading', { name: 'Game Details' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Name, location and dates')).toBeInTheDocument();
    expect(screen.getByText('Section content')).toBeInTheDocument();
  });

  it('disables Save and Cancel when nothing has changed', () => {
    const { save, cancel } = renderCard({
      onSave: vi.fn(),
      onCancel: vi.fn(),
    });
    expect(save).toBeDisabled();
    expect(cancel).toBeDisabled();
    expect(screen.queryByText('Unsaved changes')).not.toBeInTheDocument();
  });

  it('enables Save and Cancel and says so when there are unsaved changes', () => {
    const onSave = vi.fn();
    const onCancel = vi.fn();
    const { save, cancel } = renderCard({ isDirty: true, onSave, onCancel });

    expect(screen.getByText('Unsaved changes')).toBeInTheDocument();
    fireEvent.click(save);
    fireEvent.click(cancel);
    expect(onSave).toHaveBeenCalledOnce();
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('disables Save and shows the error count when there are errors', () => {
    const { save, cancel } = renderCard({
      isDirty: true,
      errorCount: 2,
      onSave: vi.fn(),
      onCancel: vi.fn(),
    });
    expect(save).toBeDisabled();
    expect(cancel).toBeEnabled();
    expect(screen.getByText('2 errors to fix')).toBeInTheDocument();
  });

  it('uses the singular for one error', () => {
    renderCard({ isDirty: true, errorCount: 1, onSave: vi.fn() });
    expect(screen.getByText('1 error to fix')).toBeInTheDocument();
  });

  it('disables both buttons and shows Saving… while saving', () => {
    const { save, cancel } = renderCard({
      isDirty: true,
      isSaving: true,
      onSave: vi.fn(),
      onCancel: vi.fn(),
    });
    expect(save).toHaveTextContent('Saving…');
    expect(save).toBeDisabled();
    expect(cancel).toBeDisabled();
  });

  it('keeps Save and Cancel disabled when the section passes no handlers', () => {
    const { save, cancel } = renderCard({ isDirty: true });
    expect(save).toBeDisabled();
    expect(cancel).toBeDisabled();
  });
});
