// AI contribution: 50% AI-generated
// AI Generated content for refactoring of code duplication in ContactsGridPage.tsx and TestGridPage.tsx files.
'use client';

import { useEffect, useRef, useState } from 'react';
import Grid, { ColumnDefinition } from '@/components/commons/Grid';
import GridHeaderPage from '@/components/commons/GridHeader';
import SearchBar from '@/components/commons/SearchBar';
import { asDraftRows } from '@/lib/draft-keys';
import {
  getDraftStatusMessage,
  useDraftAutosave,
} from '@/hooks/useDraftAutosave';
import { useGrid } from '@/hooks/useGrid';
import { useGridValidation } from '@/hooks/useGridValidation';

interface BaseGridPageProps<T extends Record<string, unknown>> {
  title: string;
  description?: string;
  initialData?: T[];
  initialDraft?: unknown;
  initiallyRestoredDraft?: boolean;
  draftKey?: string;
  draftSchemaVersion?: number;
  clearDraftOnSave?: boolean;
  restoreDraft?: (draft: unknown) => T[] | undefined;
  serializeDraft?: (rows: T[]) => unknown;
  columns: ColumnDefinition<T>[];
  createEmptyRow: () => T;
  addButtonLabel?: string;
  searchPlaceholder?: string;
  showSearch?: boolean;
  allowDelete?: boolean;
  allowAddRow?: boolean;
  readOnly?: boolean;
  onSave?: (savedRows: (T & { id: string })[]) => void | Promise<unknown>;
  isValid?: (rows: (T & { id: string })[]) => boolean;
  minWidth?: number | string;
  fitWidth?: boolean;
  // optional: tells the page the current rows (typing, add, delete, cancel)
  onRowsChange?: (rows: (T & { id: string })[]) => void;
  onEditingChange?: (editing: boolean) => void;
  onDraftCleared?: () => void;
}

export default function BaseGridPage<T extends Record<string, unknown>>({
  title,
  description,
  initialData = [],
  initialDraft,
  initiallyRestoredDraft = false,
  draftKey,
  draftSchemaVersion = 1,
  clearDraftOnSave = true,
  restoreDraft,
  serializeDraft,
  columns,
  createEmptyRow,
  addButtonLabel = 'Add Row',
  searchPlaceholder = 'Search records...',
  showSearch = true,
  allowDelete = true,
  allowAddRow = true,
  readOnly = false,
  onSave,
  isValid,
  minWidth,
  fitWidth,
  onRowsChange,
  onEditingChange,
  onDraftCleared,
}: BaseGridPageProps<T>) {
  const [isPreview, setIsPreview] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDiscardingDraft, setIsDiscardingDraft] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [draftCleanupError, setDraftCleanupError] = useState(false);
  const savingRef = useRef(false);
  const restoredDraft =
    initialDraft === undefined
      ? undefined
      : restoreDraft
        ? restoreDraft(initialDraft)
        : asDraftRows<T & { id: string }>(initialDraft);
  const canonicalRows = initialData as (T & { id: string })[];
  const initialRows = (restoredDraft ?? canonicalRows) as (T & {
    id: string;
  })[];
  const {
    rows,
    setRows,
    isEditing,
    setIsEditing,
    markRowsSaved,
    resetTo,
    handleSave,
    handleAddRow,
  } = useGrid<T & { id: string }>(
    initialRows,
    createEmptyRow as () => T & { id: string },
    async (savedRows) => {
      if (onSave) {
        return await onSave(savedRows);
      } else {
        console.log(`Saved ${title} to API:`, savedRows);
      }
    },
  );

  const { getCellError, hasErrors: hasValidationError } = useGridValidation(
    rows,
    columns,
  );
  const hasInvalidDigits = rows.some((row) =>
    columns.some(
      (column) =>
        column.digitsOnly && getCellError(column, row[column.field]) !== null,
    ),
  );

  const draft = useDraftAutosave({
    draftKey,
    value: rows,
    enabled: isEditing && !readOnly,
    canPersist: !hasInvalidDigits,
    schemaVersion: draftSchemaVersion,
    serialize: serializeDraft,
    initiallyRestored: restoredDraft !== undefined || initiallyRestoredDraft,
    onPersist: markRowsSaved,
  });

  // lets a page show its own live warnings while editing
  useEffect(() => {
    onRowsChange?.(rows);
  }, [rows, onRowsChange]);

  // filtering rows based on a match of any traveller field
  const filteredRows = rows.filter((row) =>
    Object.values(row).some((val) =>
      String(val ?? '')
        .toLowerCase()
        .includes(searchQuery.toLowerCase()),
    ),
  );
  // handler for updating rows and not getting rid of non filtered items
  const handleRowsChange = (
    newFilteredOrUpdatedRows: (T & { id: string })[],
  ) => {
    if (searchQuery) {
      setRows((prevRows) => {
        const updatedMap = new Map(
          newFilteredOrUpdatedRows.map((r) => [r.id, r]),
        );

        return prevRows.map((row) => {
          return updatedMap.has(row.id) ? updatedMap.get(row.id)! : row;
        });
      });
    } else {
      setRows(newFilteredOrUpdatedRows);
    }
  };

  const isInvalid = hasValidationError || (isValid ? !isValid(rows) : false);
  const canonicalSnapshot = JSON.stringify(
    serializeDraft ? serializeDraft(canonicalRows) : canonicalRows,
  );
  const currentSnapshot = JSON.stringify(
    serializeDraft ? serializeDraft(rows) : rows,
  );
  const hasLocalChanges = currentSnapshot !== canonicalSnapshot;
  const draftStatusMessage =
    draftKey && isEditing && !readOnly && hasInvalidDigits && !isDiscardingDraft
      ? 'Fix invalid inputs. Draft not saved'
      : getDraftStatusMessage({
          status: draft.status,
          isDraftSaving: draft.isSaving,
          isPending: draft.isPending,
          isSavingChanges: isSaving,
          isDiscarding: isDiscardingDraft,
          saveError,
          cleanupError: draftCleanupError,
        });

  const discardDraft = async () => {
    if (savingRef.current || isDiscardingDraft) return;
    if (
      (draft.hasPersistedDraft || hasLocalChanges) &&
      !window.confirm(
        'Discard this draft and restore the last saved database values? This cannot be undone.',
      )
    ) {
      return;
    }

    setIsDiscardingDraft(true);
    setDraftCleanupError(false);
    setSaveError(false);
    draft.cancelPending();
    try {
      await draft.clear('discarded', canonicalRows);
      onDraftCleared?.();
      resetTo(canonicalRows);
      onEditingChange?.(false);
      setIsPreview(false);
    } catch {
      setDraftCleanupError(true);
    } finally {
      setIsDiscardingDraft(false);
    }
  };

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
      <GridHeaderPage
        title={title}
        description={description}
        readOnly={readOnly}
        isSaving={isSaving || isDiscardingDraft || draft.isSaving}
        isEditing={isEditing && !readOnly}
        isPreview={isPreview}
        hasDraft={draft.hasPersistedDraft}
        statusMessage={draftStatusMessage}
        discardLabel={draftKey ? 'Discard draft' : 'Discard changes'}
        onEditToggle={() => {
          setSaveError(false);
          draft.cancelPending();
          const nextEditing = !isEditing;
          if (nextEditing) {
            setRows((currentRows) =>
              currentRows.map((row) => {
                const normalized = { ...row };
                for (const column of columns) {
                  const value = row[column.field];
                  if (column.digitsOnly && typeof value === 'string') {
                    Object.assign(normalized, {
                      [column.field]: value.replace(/[+\s().-]/g, ''),
                    });
                  }
                }
                return normalized;
              }),
            );
          }
          setIsEditing(nextEditing);
          onEditingChange?.(nextEditing);
          setIsPreview(false);
        }}
        onPreviewToggle={(previewState) => {
          if (previewState && isInvalid) {
            alert(
              'Please fix the invalid range inputs before switching to preview.',
            );
            return;
          }
          setIsPreview(previewState);
        }}
        onSave={async () => {
          if (isInvalid) {
            alert('Please fix the invalid range inputs before saving.');
            return;
          }
          if (savingRef.current) return;

          savingRef.current = true;
          setIsSaving(true);
          setSaveError(false);
          setDraftCleanupError(false);
          try {
            await draft.flush(rows);
            await handleSave();
            onEditingChange?.(false);
            setIsPreview(false);
            if (draftKey && clearDraftOnSave) {
              try {
                await draft.clear('committed');
                onDraftCleared?.();
              } catch {
                setDraftCleanupError(true);
              }
            }
          } catch {
            setSaveError(true);
          } finally {
            savingRef.current = false;
            setIsSaving(false);
          }
        }}
        onCancel={discardDraft}
      />

      {draftCleanupError && (
        <p role="alert" className="text-sm text-amber-700">
          The draft could not be deleted. Your data has not been discarded.
        </p>
      )}

      {showSearch && (
        <div className="max-w-md">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={searchPlaceholder}
          />
        </div>
      )}

      <Grid
        columns={columns}
        rows={filteredRows} // fix for row filtering correctly
        isEditing={isEditing && !readOnly && !isSaving}
        isPreview={isPreview}
        onRowsChange={handleRowsChange}
        onAddRow={handleAddRow}
        addButtonLabel={addButtonLabel}
        allowDelete={allowDelete && !readOnly}
        allowAddRow={allowAddRow && !readOnly}
        minWidth={minWidth}
        fitWidth={fitWidth}
      />
    </div>
  );
}
