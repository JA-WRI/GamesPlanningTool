//  No substantial AI-generated code
'use client';

import { Trash2 } from 'lucide-react';

interface GridHeaderProps {
  title: string;
  description?: string;
  readOnly?: boolean;
  isEditing: boolean;
  isPreview: boolean;
  isSaving?: boolean;
  hasDraft?: boolean;
  statusMessage?: string;
  discardLabel?: string;
  saveLabel?: string;
  onEditToggle: () => void;
  onPreviewToggle: (preview: boolean) => void;
  onSave: () => void | Promise<void>;
  onCancel?: () => void;
}

export default function GridHeaderPage({
  title,
  description,
  readOnly = false,
  isEditing,
  isPreview,
  isSaving = false,
  hasDraft = false,
  statusMessage,
  discardLabel = 'Cancel',
  saveLabel = 'Save changes',
  onEditToggle,
  onPreviewToggle,
  onSave,
  onCancel,
}: GridHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200">
      {/* Title and description of the table */}
      <div className="flex items-baseline gap-4 flex-wrap">
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        {description && (
          <p className="text-sm text-muted mt-1">{description}</p>
        )}
      </div>
      {/*Edit, cancel, and save buttons*/}
      {!readOnly && (
        <div className="flex min-w-0 shrink-0 flex-col items-end gap-2">
          <div className="flex flex-wrap items-center justify-end gap-3">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={onCancel || onEditToggle}
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors cursor-pointer disabled:cursor-wait disabled:opacity-70"
                >
                  {discardLabel === 'Discard draft' && <Trash2 size={16} />}
                  {discardLabel}
                </button>
                {/* pill toggle for edit view and preview */}
                <div className="flex items-center bg-gray-100 p-1 rounded-full border border-gray-200 shadow-inner">
                  <button
                    type="button"
                    onClick={() => onPreviewToggle(false)}
                    disabled={isSaving}
                    className={`px-3.5 py-1.5 text-xs font-medium rounded-full transition-all cursor-pointer ${
                      !isPreview
                        ? 'bg-burgundy text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Edit View
                  </button>
                  <button
                    type="button"
                    onClick={() => onPreviewToggle(true)}
                    disabled={isSaving}
                    className={`px-3.5 py-1.5 text-xs font-medium rounded-full transition-all cursor-pointer ${
                      isPreview
                        ? 'bg-burgundy text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Preview
                  </button>
                </div>

                <button
                  type="button"
                  onClick={onSave}
                  disabled={isSaving}
                  aria-busy={isSaving}
                  className="px-5 py-2 text-sm font-medium text-white bg-burgundy hover:bg-burgundy/90 rounded-md transition-colors shadow-sm cursor-pointer disabled:cursor-wait disabled:opacity-70"
                >
                  {isSaving ? 'Saving...' : saveLabel}
                </button>
              </>
            ) : (
              <>
                {hasDraft && (
                  <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-white border border-red-200 rounded-md hover:bg-red-50 transition-colors cursor-pointer disabled:cursor-wait disabled:opacity-70"
                  >
                    <Trash2 size={16} />
                    Discard draft
                  </button>
                )}
                <button
                  type="button"
                  onClick={onEditToggle}
                  className="px-5 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors cursor-pointer"
                >
                  Edit
                </button>
              </>
            )}
          </div>
          {statusMessage && (
            <span
              role="status"
              aria-live="polite"
              className="max-w-full text-right text-xs text-gray-600"
            >
              {statusMessage}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
