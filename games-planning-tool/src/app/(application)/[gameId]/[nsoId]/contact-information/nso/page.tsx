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

const contactColumns: ColumnDefinition<ContactRow>[] = [
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

// To be deleted after all ui implementation
const initialData: ContactRow[] = [
  {
    id: '1',
    firstName: 'Harmoni',
    lastName: 'Shaw',
    email: 'hshaw@olympic.ca',
    role: 'HPA',
    countryCode: '1',
    phone: '514-555-0192',
  },
  {
    id: '2',
    firstName: 'Elliot',
    lastName: 'Wilkerson',
    email: 'ewilkerson@olympic.ca',
    role: 'Doctor',
    countryCode: '1',
    phone: '+1 514-555-0144',
  },
  {
    id: '3',
    firstName: 'Janiyah',
    lastName: 'Conner',
    email: 'jconner@olympic.ca',
    role: 'Media Attaché',
    countryCode: '1',
    phone: '+1 514-555-0188',
  },
];

export default function page() {
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
      id: Date.now().toString(),
      firstName: '',
      lastName: '',
      email: '',
      role: '',
      countryCode: '',
      phone: '',
    }),
    (savedRows) => {
      console.log('Saved to API:', savedRows);
    },
  );

  return (
    <div className="space-y-6">
      <ContactInfoHeaderPage
        title="NSO Contacts"
        description="National Sport Organization contact details and representative information."
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
