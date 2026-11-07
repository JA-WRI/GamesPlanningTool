// AI contribution: Below 50% AI-generated
// AI Generated content for refactoring of code duplication in page.tsx files.
'use client';
import { useMemo } from 'react';
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

export const nsoContactColumns: ColumnDefinition<ContactRow>[] = [
  {
    field: 'role',
    label: 'Role',
    placeholder: 'Enter Role',
    align: 'left',
    readOnly: true,
  },
  { field: 'firstName', label: 'First Name', placeholder: 'Enter First Name' },
  { field: 'lastName', label: 'Last Name', placeholder: 'Enter Last Name' },
  {
    field: 'email',
    label: 'Email Address',
    type: 'email',
    placeholder: 'Enter Email',
  },
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

const createRowForRole = (role: string): ContactRow => ({
  id: crypto.randomUUID(),
  firstName: '',
  lastName: '',
  email: '',
  role,
  countryCode: '',
  phone: '',
});

interface ContactsGridNSOPageProps {
  title: string;
  description: string;
  roles: string[];
  initialData?: ContactRow[];
  readOnly?: boolean;
}

export default function ContactsGridNSOPage({
  title,
  description,
  roles,
  initialData = [],
  readOnly = false,
}: ContactsGridNSOPageProps) {
  const rows = useMemo(
    () =>
      roles.map(
        (role) =>
          initialData.find((r) => r.role === role) ?? createRowForRole(role),
      ),
    [roles, initialData],
  );
  return (
    <BaseGridPage<ContactRow>
      key={roles.join('|')}
      title={title}
      description={description}
      initialData={rows}
      columns={nsoContactColumns}
      createEmptyRow={() => createRowForRole('')}
      allowAddRow={false}
      allowDelete={false}
      searchPlaceholder="Search contacts by name, email, role..."
      readOnly={readOnly}
    />
  );
}
