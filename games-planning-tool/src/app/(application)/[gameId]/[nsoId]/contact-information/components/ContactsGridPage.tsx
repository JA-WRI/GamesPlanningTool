// AI contribution: Below 50% AI-generated
// AI Generated content for refactoring of code duplication in page.tsx files.
'use client';

import React from 'react';
import { ColumnDefinition } from '@/components/commons/Grid';
import BaseGridPage from '@/components/commons/BaseGridPage';

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
  return (
    <BaseGridPage<ContactRow>
      title={title}
      description={description}
      initialData={initialData}
      columns={contactColumns}
      createEmptyRow={() => ({
        id: crypto.randomUUID(),
        firstName: '',
        lastName: '',
        email: '',
        role: '',
        countryCode: '',
        phone: '',
      })}
      addButtonLabel="Add Another Contact"
      searchPlaceholder="Search contacts by name, email, role..."
    />
  );
}
