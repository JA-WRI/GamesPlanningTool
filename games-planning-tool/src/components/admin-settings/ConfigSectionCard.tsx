// More than 50% AI Generated code
'use client';

import { useUnsavedChangesWarning } from './UnsavedChangesGuard';

// Step frame every Game setup section wraps its content in:
// title, body, and a Save / Cancel footer.
// The section owns its form state and passes it in; this component only
// decides what the footer shows and when Save is allowed.

type ConfigSectionCardProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
  isDirty?: boolean; // true when there are unsaved changes
  errorCount?: number; // validation errors; any error disables Save
  isSaving?: boolean;
  onSave?: () => void;
  onCancel?: () => void; // should restore the last saved values
};

export default function ConfigSectionCard({
  title,
  description,
  children,
  isDirty = false,
  errorCount = 0,
  isSaving = false,
  onSave,
  onCancel,
}: ConfigSectionCardProps) {
  const canSave = isDirty && errorCount === 0 && !isSaving && !!onSave;
  const canCancel = isDirty && !isSaving && !!onCancel;

  // Asks before leaving the step while there are unsaved changes;
  // "Discard changes" runs onCancel to restore the saved values.
  useUnsavedChangesWarning(isDirty, onCancel);

  return (
    <div className="bg-surface flex flex-col rounded-lg border border-black/15 shadow-sm">
      <header className="mx-4 border-b border-black/15 pt-4 pb-3 sm:mx-6">
        <h2 className="text-2xl">{title}</h2>
        {description && (
          <p className="text-muted mt-1 text-sm">{description}</p>
        )}
      </header>

      <div className="min-h-80 flex-1 px-4 py-4 sm:px-6">{children}</div>

      <footer className="mx-4 flex items-center justify-end gap-3 border-t border-black/15 py-3 sm:mx-6">
        <FooterNote isDirty={isDirty} errorCount={errorCount} />
        <button
          type="button"
          onClick={onCancel}
          disabled={!canCancel}
          className="rounded bg-black/10 px-4 py-1.5 text-sm hover:bg-black/15 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={!canSave}
          className="rounded bg-black/10 px-4 py-1.5 text-sm hover:bg-black/15 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? 'Saving…' : 'Save'}
        </button>
      </footer>
    </div>
  );
}

function FooterNote({
  isDirty,
  errorCount,
}: {
  isDirty: boolean;
  errorCount: number;
}) {
  let text = '';
  let tone = 'text-muted';
  if (errorCount > 0) {
    text = `${errorCount} ${errorCount === 1 ? 'error' : 'errors'} to fix`;
    tone = 'text-error';
  } else if (isDirty) {
    text = 'Unsaved changes';
    tone = 'text-warning';
  }

  return (
    <p className={`mr-auto text-sm ${tone}`} aria-live="polite">
      {text}
    </p>
  );
}
