// AI Generated content for refactoring of code duplication in page.tsx files.
'use client';

import React from 'react';
import Grid, { ColumnDefinition } from '@/components/layout/Grid';
import ContactInfoHeaderPage from '@/components/layout/ContactInfoHeader';
import { useGrid } from '@/hooks/useGrid';

export interface ContactRow {
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
  { field: 'role', label: 'Role', placeholder: 'Enter Role' },
  {
    field: 'countryCode',
    label: 'Country Code',
    placeholder: 'Enter Country Code',
  },
  {
    field: 'phone',
    label: 'Telephone Number',
    type: 'tel',
    placeholder: 'Enter Phone Number',
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

  return (
    <div className="space-y-6">
      <ContactInfoHeaderPage
        title={title}
        description={description}
        isEditing={isEditing}
        onEditToggle={() => setIsEditing(!isEditing)}
        onSave={handleSave}
        onCancel={handleCancel}
      />

      <Grid
        columns={contactColumns}
        rows={rows}
        isEditing={isEditing}
        onRowsChange={setRows}
        onAddRow={handleAddRow}
        addButtonLabel="Add Another Contact"
      />
    </div>
  );
}
