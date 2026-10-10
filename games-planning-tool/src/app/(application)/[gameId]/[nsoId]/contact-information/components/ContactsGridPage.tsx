// AI Generated content for refactoring of code duplication in page.tsx files.
'use client';

import React from 'react';
import { useState } from 'react';
import Grid, { ColumnDefinition } from '@/components/commons/Grid';
import GridHeaderPage from '@/components/commons/GridHeader';
import { useGrid } from '@/hooks/useGrid';
import SearchBar from '@/components/commons/SearchBar';

export interface ContactRow extends Record<string, unknown> {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  countryCode: string;
  phone: string;
}

export const contactColumns: ColumnDefinition<ContactRow>[] = [
  { field: 'firstName', label: 'First Name', placeholder: 'Enter First Name' },
  { field: 'lastName', label: 'Last Name', placeholder: 'Enter Last Name' },
  {
    field: 'email',
    label: 'Email Address',
    type: 'email',
    placeholder: 'Enter Email',
  },
  { field: 'role', label: 'Role', placeholder: 'Enter Role', align: 'center' },
  {
    field: 'countryCode',
    label: 'Country Code',
    placeholder: 'Enter Country Code',
    align: 'center',
  },
  {
    field: 'phone',
    label: 'Telephone Number',
    type: 'tel',
    placeholder: 'Enter Phone Number',
    align: 'center',
  },
];

interface ContactsGridPageProps {
  title: string;
  description: string;
  initialData?: ContactRow[];
}

export default function ContactsGridPage({
  title,
  description,
  initialData = [],
}: ContactsGridPageProps) {
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
  } = useGrid<ContactRow>(
    initialData,
    () => ({
      id: crypto.randomUUID(),
      firstName: '',
      lastName: '',
      email: '',
      role: '',
      countryCode: '',
      phone: '',
    }),
    (savedRows) => {
      console.log(`Saved ${title} to API:`, savedRows);
    },
  );
  // filtering rows based on a match of any contact field
  const filteredRows = rows.filter((row) =>
    Object.values(row).some((val) =>
      String(val ?? '')
        .toLowerCase()
        .includes(searchQuery.toLowerCase()),
    ),
  );

  return (
    <div className="space-y-6">
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
          placeholder="Search contacts by name, email, role..."
        />
      </div>
      <Grid
        columns={contactColumns}
        rows={filteredRows} //fix for row filtering correctly
        isEditing={isEditing}
        isPreview={isPreview}
        onRowsChange={setRows}
        onAddRow={handleAddRow}
        addButtonLabel="Add Another Contact"
      />
    </div>
  );
}
