// AI contribution: Below 50% AI-generated
// AI Generated content for refactoring of code duplication in page.tsx files.
'use client';

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

export const cocContactColumns: ColumnDefinition<ContactRow>[] = [
  { field: 'role', label: 'Role', placeholder: 'Enter Role', align: 'left' },
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

interface ContactsGridCOCPageProps {
  title: string;
  description: string;
  initialData?: ContactRow[];
  readOnly?: boolean;
}

export default function ContactsGridCOCPage({
  title,
  description,
  initialData = [],
  readOnly = false,
}: ContactsGridCOCPageProps) {
  return (
    <BaseGridPage<ContactRow>
      title={title}
      description={description}
      initialData={initialData}
      columns={cocContactColumns}
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
      readOnly={readOnly}
    />
  );
}
