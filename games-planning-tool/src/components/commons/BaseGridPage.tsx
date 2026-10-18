// AI contribution: Below 50% AI-generated
// AI Generated content for refactoring of code duplication in ContactsGridPage.tsx and TestGridPage.tsx files.
'use client';

import { useState } from 'react';
import Grid, { ColumnDefinition } from '@/components/commons/Grid';
import GridHeaderPage from '@/components/commons/GridHeader';
import SearchBar from '@/components/commons/SearchBar';
import { useGrid } from '@/hooks/useGrid';

interface BaseGridPageProps<T extends Record<string, unknown>> {
  title: string;
  description?: string;
  initialData?: T[];
  columns: ColumnDefinition<T>[];
  createEmptyRow: () => T;
  addButtonLabel?: string;
  searchPlaceholder?: string;
  showSearch?: boolean;
  allowDelete?: boolean;
  allowAddRow?: boolean;
  onSave?: (savedRows: (T & { id: string })[]) => void;
  isValid?: (rows: (T & { id: string })[]) => boolean;
}

export default function BaseGridPage<T extends Record<string, unknown>>({
  title,
  description,
  initialData = [],
  columns,
  createEmptyRow,
  addButtonLabel = 'Add Row',
  searchPlaceholder = 'Search records...',
  showSearch = true,
  allowDelete = true,
  allowAddRow = true,
  onSave,
  isValid,
}: BaseGridPageProps<T>) {
  const [isPreview, setIsPreview] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasValidationError, setHasValidationError] = useState(false);
  const {
    rows,
    setRows,
    isEditing,
    setIsEditing,
    handleSave,
    handleCancel,
    handleAddRow,
  } = useGrid<T & { id: string }>(
    initialData as (T & { id: string })[],
    createEmptyRow as () => T & { id: string },
    (savedRows) => {
      if (onSave) {
        onSave(savedRows);
      } else {
        console.log(`Saved ${title} to API:`, savedRows);
      }
    },
  );

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

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
      <GridHeaderPage
        title={title}
        description={description}
        isEditing={isEditing}
        isPreview={isPreview}
        onEditToggle={() => {
          setIsEditing(!isEditing);
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
        onSave={() => {
          if (isInvalid) {
            alert('Please fix the invalid range inputs before saving.');
            return;
          }
          handleSave();
          setIsPreview(false);
        }}
        onCancel={() => {
          handleCancel();
          setIsPreview(false);
        }}
      />

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
        isEditing={isEditing}
        isPreview={isPreview}
        onRowsChange={handleRowsChange}
        onAddRow={handleAddRow}
        addButtonLabel={addButtonLabel}
        onValidationChange={(errorState) => setHasValidationError(errorState)}
        allowDelete={allowDelete}
        allowAddRow={allowAddRow}
      />
    </div>
  );
}
