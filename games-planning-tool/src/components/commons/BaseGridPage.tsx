// AI contribution: Below 50% AI-generated
// AI Generated content for refactoring of code duplication in ContactsGridPage.tsx and TestGridPage.tsx files.
'use client';

import React, { useState } from 'react';
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
  addButtonLabel: string;
  searchPlaceholder?: string;
}

export default function BaseGridPage<T extends Record<string, unknown>>({
  title,
  description,
  initialData = [],
  columns,
  createEmptyRow,
  addButtonLabel,
  searchPlaceholder = 'Search records...',
}: BaseGridPageProps<T>) {
  const [isPreview, setIsPreview] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
      console.log(`Saved ${title} to API:`, savedRows);
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
        onPreviewToggle={(previewState) => setIsPreview(previewState)}
        onSave={() => {
          handleSave();
          setIsPreview(false);
        }}
        onCancel={() => {
          handleCancel();
          setIsPreview(false);
        }}
      />

      <div className="max-w-md">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={searchPlaceholder}
        />
      </div>

      <Grid
        columns={columns}
        rows={filteredRows} // fix for row filtering correctly
        isEditing={isEditing}
        isPreview={isPreview}
        onRowsChange={setRows as (newRows: T[]) => void}
        onAddRow={handleAddRow}
        addButtonLabel={addButtonLabel}
      />
    </div>
  );
}
