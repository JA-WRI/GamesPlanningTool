// AI contribution: Below 50% AI-generated
// AI Generated content for refactoring of code duplication in page.tsx files.
'use client';
import { useMemo } from 'react';
import { ColumnDefinition } from '@/components/commons/Grid';
import BaseGridPage from '@/components/commons/BaseGridPage';
import {
  ContactRow,
  baseContactColumns,
  createEmptyContactRow,
} from '@/components/contact-information/ContactGrid';

export const nsoContactColumns: ColumnDefinition<ContactRow>[] =
  baseContactColumns.map((col) =>
    col.field === 'role' ? { ...col, readOnly: true } : col,
  );

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
          initialData.find((r) => r.role === role) ??
          createEmptyContactRow(role),
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
      createEmptyRow={() => createEmptyContactRow()}
      allowAddRow={false}
      allowDelete={false}
      searchPlaceholder="Search contacts by name, email, role..."
      readOnly={readOnly}
    />
  );
}
