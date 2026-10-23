//  No substantial AI-generated code
'use client';

import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ContactsSideMenu from '../../../src/features/contact-information/components/ContactsSideMenu';

vi.mock('next/navigation', () => ({
  usePathname: () => '/game1/nso1/contact-information/coc-contacts',
}));

describe('ContactsSideMenu', () => {
  it('renders navigation links and highlights active route', () => {
    render(<ContactsSideMenu />);

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('COC Contacts')).toBeInTheDocument();
    expect(screen.getByText('NSO Contacts')).toBeInTheDocument();

    const cocLink = screen.getByTitle('COC Contacts');
    expect(cocLink).toHaveAttribute('aria-current', 'page');
  });
});
