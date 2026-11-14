// AI contribution: Below 50% AI-generated
//AI was used only for refactoring -> extracting duplicate functions
import { ColumnDefinition } from '@/components/commons/Grid';

export interface ContactRow extends Record<string, unknown> {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  countryCode: string;
  phone: string;
}

export const baseContactColumns: ColumnDefinition<ContactRow>[] = [
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

export const createEmptyContactRow = (role = ''): ContactRow => ({
  id: crypto.randomUUID(),
  firstName: '',
  lastName: '',
  email: '',
  role,
  countryCode: '',
  phone: '',
});
