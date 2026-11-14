// AI contribution: Below 50% AI-generated
// AI Generated content for refactoring of code duplication in page.tsx files.
'use client';

import BaseGridPage from '@/components/commons/BaseGridPage';
import {
  ContactRow,
  baseContactColumns,
  createEmptyContactRow,
} from '@/components/contact-information/ContactGrid';

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
      columns={baseContactColumns}
      createEmptyRow={() => createEmptyContactRow()}
      addButtonLabel="Add Another Contact"
      searchPlaceholder="Search contacts by name, email, role..."
      readOnly={readOnly}
    />
  );
}
