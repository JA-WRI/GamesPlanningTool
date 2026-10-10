// No substantial AI generated code
'use client';

import React from 'react';
import { ColumnDefinition } from '@/components/commons/Grid';
import BaseGridPage from '@/components/commons/BaseGridPage';

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
    formula: {
      operator: '*',
      fieldA: 'daysOnSite',
      fieldB: 'travelRate',
    },
    formatValue: (val) => `$${val.toLocaleString('en-US')}`,
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
  return (
    <BaseGridPage<TravelerRow>
      title={title}
      description={description}
      initialData={initialData}
      columns={travelerColumns}
      createEmptyRow={() => ({
        id: crypto.randomUUID(),
        accessPrivileges: '',
        teamMembers: 1,
        daysOnSite: 7,
        travelRate: 2400,
        accomodationProperty: '',
      })}
      addButtonLabel="Add Property Row"
      searchPlaceholder="Search travelers..."
    />
  );
}
