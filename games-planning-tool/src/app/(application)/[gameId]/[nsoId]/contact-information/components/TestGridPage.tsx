// No substantial AI generated code
'use client';

import React from 'react';
import Grid, { ColumnDefinition } from '@/components/commons/Grid';
import ContactInfoHeaderPage from '@/components/commons/GridHeader';
import { useGrid } from '@/hooks/useGrid';

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
    formatValue: (val) => `$${val.toLocaleString()}`,
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

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
      <ContactInfoHeaderPage
        title={title}
        description={description}
        isEditing={isEditing}
        onEditToggle={() => setIsEditing(!isEditing)}
        onSave={handleSave}
        onCancel={handleCancel}
      />

      <Grid
        columns={travelerColumns}
        rows={rows}
        isEditing={isEditing}
        onRowsChange={setRows}
        onAddRow={handleAddRow}
        addButtonLabel="Add Property Row"
      />
    </div>
  );
}
