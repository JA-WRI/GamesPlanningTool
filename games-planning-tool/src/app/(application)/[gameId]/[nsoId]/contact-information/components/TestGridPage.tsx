// No substantial AI generated code
'use client';

import React from 'react';
import { useState } from 'react';
import Grid, { ColumnDefinition } from '@/components/commons/Grid';
import GridHeaderPage from '@/components/commons/GridHeader';
import { useGrid } from '@/hooks/useGrid';
import SearchBar from '@/components/commons/SearchBar';

export interface TravelerRow extends Record<string, unknown> {
  id: string;
  accessPrivileges: string;
  teamMembers: number;
  daysOnSite: number;
  travelRate: number;
  accomodationProperty: string;
  totalCost?: number;
}

const travelerColumns: ColumnDefinition<TravelerRow>[] = [
  {
    field: 'accessPrivileges',
    label: 'ACCESS AND PRIVILEGES',
    type: 'select',
    placeholder: 'Select category',
    options: [
      {
        label: 'Travelling Accredited Alternate Athletes',
        value: 'Travelling Accredited Alternate Athletes',
      },
      {
        label: 'Travelling Non-accredited Athletes',
        value: 'Travelling Non-accredited Athletes',
      },
      {
        label: 'Support staff @ partial NSO cost',
        value: 'Support staff @ partial NSO cost',
      },
      {
        label: 'Support staff @ full NSO cost',
        value: 'Support staff @ full NSO cost',
      },
    ],
    width: '30%',
  },
  {
    field: 'teamMembers',
    label: 'NUMBER OF TEAM MEMBERS',
    type: 'number',
    min: 1,
    align: 'center',
  },
  {
    field: 'daysOnSite',
    label: 'DAYS ON SITE',
    type: 'number',
    min: 1,
    align: 'center',
  },
  {
    field: 'travelRate',
    label: 'TRAVEL',
    subtitle: 'COC or $',
    type: 'number',
    min: 0,
    align: 'center',
  },
  {
    field: 'accomodationProperty',
    label: 'ACCOMODATION PROPERTY',
    type: 'select',
    placeholder: 'Select category',
    options: [
      {
        label: 'Milano - UNA Mediterraneo',
        value: 'Milano - UNA Mediterraneo',
      },
      {
        label: 'Cortina - Hotel de la Poste',
        value: 'Cortina - Hotel de la Poste',
      },
    ],
    width: '25%',
  },
  {
    field: 'totalCost',
    label: 'TOTAL / MEMBER',
    type: 'calculated',
    align: 'right',
    // example of field caclulated using formulas
    formula: {
      operator: '*',
      fieldA: 'daysOnSite',
      fieldB: 'travelRate',
    },
    formatValue: (val) => `$${val.toLocaleString('en-US')}`, // very important to specify the locale so there's no discrepancy between server and client
  },
];

interface TestGridPageProps {
  title: string;
  description: string;
  initialData?: TravelerRow[];
}

export default function TestGridPage({
  title,
  description,
  initialData = [],
}: TestGridPageProps) {
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
  } = useGrid<TravelerRow>(
    initialData,
    () => ({
      id: crypto.randomUUID(),
      accessPrivileges: '',
      teamMembers: 1,
      daysOnSite: 7,
      travelRate: 2400,
      accomodationProperty: '',
    }),
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
          setIsPreview(false); // this is false to always start in edit mode
        }}
        onCancel={() => {
          handleCancel();
          setIsPreview(false); // same here, false to start in edit mode
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
        columns={travelerColumns}
        rows={filteredRows} //fix for row filtering correctly
        isEditing={isEditing}
        isPreview={isPreview}
        onRowsChange={setRows}
        onAddRow={handleAddRow}
        addButtonLabel="Add Property Row"
      />
    </div>
  );
}
