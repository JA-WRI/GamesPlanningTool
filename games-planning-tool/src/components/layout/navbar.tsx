'use client';

import React from 'react';
import { usePathname, useParams } from 'next/navigation';
import { Role } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';

type NavItem = { label: string; path: string; icon: string; roles: Role[] };
const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    path: 'dashboard',
    icon: '/icons/dashboard.svg',
    roles: ['nso', 'coc', 'admin'],
  },
  {
    label: 'Team Journey',
    path: 'team-journey',
    icon: '/icons/suitcase.svg',
    roles: ['nso', 'coc', 'admin'],
  },
  {
    label: 'Calculator Estimator',
    path: 'calculator',
    icon: '/icons/calculator.svg',
    roles: ['nso', 'coc', 'admin'],
  },
  {
    label: 'Contact & Information',
    path: 'contact-information',
    icon: '/icons/contact.svg',
    roles: ['nso', 'coc', 'admin'],
  },
  {
    label: 'Resource Management',
    path: '/admin/resource-management',
    icon: '/icons/resources.svg',
    roles: ['admin'],
  },
  {
    label: 'User Management',
    path: '/admin/user-management',
    icon: '/icons/user-management.svg',
    roles: ['admin'],
  },
  {
    label: 'Configurations',
    path: '/admin/system-settings',
    icon: '/icons/gear.svg',
    roles: ['admin'],
  },
];

export default function Navbar({
  role,
  gameId,
}: {
  role: Role;
  nsoId?: string;
  gameId: string;
}) {
  const visible = navItems.filter((item) => item.roles.includes(role));
  const pathname = usePathname();
  const params = useParams<{ nsoId?: string }>();
  const nsoId = params.nsoId;

  return (
    <nav className="border-b border-gray-200">
      <ul className="flex divide-x divide-gray-200 overflow-x-auto">
        {visible.map(({ label, path, icon }) => {
          const href = path.startsWith('/')
            ? path
            : `/${gameId}/${nsoId}/${path}`;
          const active = pathname === href || pathname.startsWith(href + '/');

          return (
            <li key={href} className="flex-1 shrink-0">
              <Link
                href={href}
                className={`flex items-center justify-center gap-2 whitespace-nowrap px-20 py-4 text-sm font-medium hover:bg-gray-50 ${
                  active ? 'text-[#870606]' : 'text-gray-700'
                }`}
              >
                <Image src={icon} alt="" width={16} height={16} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
