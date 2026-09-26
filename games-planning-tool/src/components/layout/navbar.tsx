'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Navbar() {
  const pathname = usePathname();

  const navItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <rect x="3" y="3" width="7" height="7" rx="1.5" strokeWidth="1.8" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" strokeWidth="1.8" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" strokeWidth="1.8" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" strokeWidth="1.8" />
        </svg>
      ),
    },
    {
      name: 'Contact & Information',
      href: '/contact-info',
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <rect x="4" y="3" width="16" height="18" rx="2" strokeWidth="1.8" />
          <circle cx="12" cy="9" r="2.5" strokeWidth="1.8" />
          <path
            d="M8 16c0-2 2-3 4-3s4 1 4 3"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
    {
      name: 'Team Journey',
      href: '/team-journey',
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <rect x="3" y="7" width="18" height="13" rx="2" strokeWidth="1.8" />
          <path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" strokeWidth="1.8" />
          <line
            x1="3"
            y1="12"
            x2="21"
            y2="12"
            strokeWidth="1.5"
            strokeDasharray="2 2"
          />
        </svg>
      ),
    },
    {
      name: 'Calculators',
      href: '/calculator',
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <rect x="4" y="2" width="16" height="20" rx="2.5" strokeWidth="1.8" />
          <line
            x1="8"
            y1="6"
            x2="16"
            y2="6"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <circle cx="8" cy="11" r="1" fill="currentColor" />
          <circle cx="12" cy="11" r="1" fill="currentColor" />
          <circle cx="16" cy="11" r="1" fill="currentColor" />
          <circle cx="8" cy="15" r="1" fill="currentColor" />
          <circle cx="12" cy="15" r="1" fill="currentColor" />
          <circle cx="16" cy="15" r="1" fill="currentColor" />
          <circle cx="12" cy="19" r="1" fill="currentColor" />
        </svg>
      ),
    },
    {
      name: 'Resources',
      href: '/resources',
      aliases: ['/resourcese'],
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      name: 'Manage Users',
      href: '/user-management',
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <circle cx="9" cy="7" r="4" strokeWidth="1.8" />
          <path d="M19 8v6m3-3h-6" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      name: 'Configurations',
      href: '/system-settings',
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="12" r="3" strokeWidth="1.8" />
        </svg>
      ),
    },
    {
      name: 'Audit Logs',
      href: '/audit-logs',
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <line
            x1="8"
            y1="6"
            x2="21"
            y2="6"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <line
            x1="8"
            y1="12"
            x2="21"
            y2="12"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <line
            x1="8"
            y1="18"
            x2="21"
            y2="18"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <line
            x1="3"
            y1="6"
            x2="3.01"
            y2="6"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <line
            x1="3"
            y1="12"
            x2="3.01"
            y2="12"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <line
            x1="3"
            y1="18"
            x2="3.01"
            y2="18"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
  ];

  return (
    <nav className="w-full bg-white border-b border-neutral-200 shadow-xs select-none">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
        <div className="flex items-center space-x-1 sm:space-x-4 overflow-x-auto no-scrollbar py-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.aliases &&
                item.aliases.some((alias) => pathname?.startsWith(alias))) ||
              (item.href !== '/' && pathname?.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`relative flex items-center space-x-2 px-3 sm:px-4 py-3 text-sm font-semibold whitespace-nowrap transition-colors rounded-t-md cursor-pointer ${
                  isActive
                    ? 'text-neutral-900'
                    : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50'
                }`}
              >
                <span
                  className={isActive ? 'text-neutral-900' : 'text-neutral-400'}
                >
                  {item.icon}
                </span>
                <span>{item.name}</span>

                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#1e293b] rounded-t-sm" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
export default Navbar;
