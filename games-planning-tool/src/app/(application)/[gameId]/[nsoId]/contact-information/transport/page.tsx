'use client';

import React from 'react';
import { useState } from 'react';
import Grid, { ColumnDefinition } from '@/components/layout/Grid';
import ContactInfoHeaderPage from '@/components/layout/ContactInfoHeader';
import { useGrid } from '@/hooks/useGrid';

export interface ContactRow extends Record<string, unknown> {
  id: string;
  firstName: string;
  lastName: string;
  carType: string;
  role: string;
  countryCode: string;
  phone: string;
  additionalComments: string;
}

const contactColumns: ColumnDefinition<ContactRow>[] = [
  { field: 'firstName', label: 'First Name', placeholder: 'Enter First Name' },
  { field: 'lastName', label: 'Last Name', placeholder: 'Enter Last Name' },
  {
    field: 'carType',
    label: 'Car Type',
    placeholder: 'Enter Car Type',
    align: 'center',
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
  {
    field: 'additionalComments',
    label: 'Additional Comments',
    placeholder: 'Enter Additional Comments',
  },
];

// To be deleted after all ui implementation
const initialData: ContactRow[] = [
  {
    id: '1',
    firstName: 'Harmoni',
    lastName: 'Shaw',
    carType: 'Van',
    role: 'Driver',
    countryCode: '1',
    phone: '514-555-0192',
    additionalComments: 'Will be late.',
  },
  {
    id: '2',
    firstName: 'Elliot',
    lastName: 'Wilkerson',
    carType: 'Van',
    role: 'Driver',
    countryCode: '1',
    phone: '514-555-0144',
    additionalComments: '',
  },
  {
    id: '3',
    firstName: 'Janiyah',
    lastName: 'Conner',
    carType: 'Van',
    role: 'Driver',
    countryCode: '1',
    phone: '514-555-0188',
    additionalComments: '',
  },
];

export default function Page() {
  const [transportInfo, setTransportInfo] = useState('');
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
      carType: '',
      role: '',
      countryCode: '',
      phone: '',
      additionalComments: '',
    }),
    (savedRows) => {
      console.log('Saved to API:', savedRows);
    },
  );

  return (
    <div className="space-y-6">
      <ContactInfoHeaderPage
        title="Games Transportation Information"
        description="Schedules, shuttle routes, and transportation guidelines for the Games."
        isEditing={isEditing}
        onEditToggle={() => setIsEditing(!isEditing)}
        onSave={handleSave}
        onCancel={handleCancel}
      />
      {/* Transport Information Information Field */}
      <div className="space-y-2">
        <label
          htmlFor="transport-info"
          className="block text-sm font-medium text-gray-700"
        >
          Additional Transport Information
        </label>
        {isEditing ? (
          <textarea
            id="transport-info"
            rows={4}
            value={transportInfo}
            onChange={(e) => setTransportInfo(e.target.value)}
            placeholder="Enter transport information..."
            className="w-full max-w-2xl p-3 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-burgundy focus:border-burgundy shadow-sm resize-y"
          />
        ) : (
          <div className="w-full max-w-2xl min-h-[100px] p-3 text-sm bg-white border border-gray-200 rounded-lg text-gray-800 whitespace-pre-wrap shadow-sm">
            {transportInfo || ''}
          </div>
        )}
      </div>
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
