//60% AI to create the 3 dot overflow view of the navbar.
'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { usePathname, useParams, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Role } from '@/lib/types';
import { Games, Nsos } from '@/lib/data';
import { tabRoute, isActive } from '@/lib/routing/navigation';

type NavItem = {
  label: string;
  path: string;
  icon: string;
  roles: Role[];
};

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
    label: 'Resources',
    path: 'resources',
    icon: '/icons/resources.svg',
    roles: ['nso'],
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
  userNsoId,
}: {
  role: Role;
  userNsoId?: string;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { nsoId, gameId } = useParams<{
    nsoId?: string;
    gameId?: string;
  }>();

  const game = gameId ?? Games[0].id;
  const pickedNso = nsoId ?? searchParams.get('nso');

  const nso =
    role === 'nso' ? (userNsoId ?? Nsos[0].id) : (pickedNso ?? Nsos[0].id);

  // Keeps the selected NSO when COC/Admin navigate between pages.
  const withNso = (url: string) =>
    role !== 'nso' && pickedNso ? `${url}?nso=${pickedNso}` : url;

  // Only show navigation items allowed for the current role.
  const visible = navItems.filter((item) => item.roles.includes(role));

  const items = visible.map(({ label, path, icon }) => {
    const { route, href } = tabRoute(path, {
      role,
      game,
      nso,
      picked: pickedNso,
    });
    return { label, path, icon, href, active: isActive(pathname, route) };
  });

  /*
   * References used to measure how much space each navigation item needs.
   */
  const containerRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const moreBtnRef = useRef<HTMLButtonElement>(null);
  const moreBtnMeasureRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);

  const [visibleCount, setVisibleCount] = useState(items.length);
  const [menuOpen, setMenuOpen] = useState(false);

  /*
   * Calculate how many navigation items can fit.
   *
   * This is intentionally inside the effect instead of useCallback.
   * That avoids the react-hooks/preserve-manual-memoization ESLint error.
   */
  useLayoutEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    const recalculate = () => {
      const containerWidth = container.clientWidth;

      // Width of the three-dot button.
      const moreWidth = moreBtnMeasureRef.current?.offsetWidth ?? 48;

      const borderWidth = 1;
      const buffer = 4;

      let usedWidth = 0;
      let count = 0;

      for (let i = 0; i < items.length; i++) {
        const element = itemRefs.current[i];

        if (!element) continue;

        const itemWidth = element.getBoundingClientRect().width;

        // We only need to reserve space for the three-dot button
        // if there are still items left after this one.
        const hasMoreItems = i < items.length - 1;

        const availableWidth = hasMoreItems
          ? containerWidth - moreWidth - buffer
          : containerWidth - buffer;

        const projectedWidth =
          usedWidth + itemWidth + (count > 0 ? borderWidth : 0);

        if (projectedWidth <= availableWidth) {
          usedWidth = projectedWidth;
          count++;
        } else {
          break;
        }
      }

      setVisibleCount(count);
    };

    // Calculate immediately.
    recalculate();

    // Recalculate whenever the navbar changes size.
    const observer = new ResizeObserver(recalculate);
    observer.observe(container);

    // Also handle browser resizing.
    window.addEventListener('resize', recalculate);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', recalculate);
    };
  }, [items.length]);

  /*
   * Close the three-dot menu when clicking outside of it.
   */
  useLayoutEffect(() => {
    if (!menuOpen) return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as Node;

      const clickedMoreButton = moreBtnRef.current?.contains(target);

      const clickedDropdown = dropdownRef.current?.contains(target);

      if (!clickedMoreButton && !clickedDropdown) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClick);

    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [menuOpen]);

  const shownItems = items.slice(0, visibleCount);
  const overflowItems = items.slice(visibleCount);

  return (
    <nav className="relative border-b border-gray-200">
      {/* 
        Hidden row used only to measure the natural width
        of every navigation item.
      */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        style={{ visibility: 'hidden' }}
      >
        <ul className="flex w-max divide-x divide-gray-200">
          {items.map(({ label, icon, href }, index) => (
            <li
              key={href}
              ref={(element) => {
                itemRefs.current[index] = element;
              }}
              className="shrink-0"
            >
              <span className="flex items-center justify-center gap-2 whitespace-nowrap px-20 py-4 text-sm font-medium">
                <Image
                  src={icon}
                  alt=""
                  width={16}
                  height={16}
                  className="w-auto"
                />

                {label}
              </span>
            </li>
          ))}

          {/* Hidden three-dot button used for measuring its width */}
          <li className="shrink-0">
            <button
              ref={moreBtnMeasureRef}
              type="button"
              tabIndex={-1}
              className="flex h-full items-center justify-center px-4 py-4 text-sm font-medium"
            >
              &#8942;
            </button>
          </li>
        </ul>
      </div>

      {/* Actual navbar */}
      <ul
        ref={containerRef}
        className="flex overflow-hidden divide-x divide-gray-200"
      >
        {shownItems.map(({ label, href, icon, active }) => (
          <li key={href} className="flex-1 shrink-0">
            <Link
              href={href}
              className={`flex items-center justify-center gap-2 whitespace-nowrap px-20 py-4 text-sm font-medium hover:bg-gray-50 ${
                active ? 'text-burgundy' : 'text-gray-700'
              }`}
            >
              <Image
                src={icon}
                alt=""
                width={16}
                height={16}
                className="w-auto"
              />

              {label}
            </Link>
          </li>
        ))}

        {/* Three-dot button */}
        {overflowItems.length > 0 && (
          <li className="shrink-0">
            <button
              ref={moreBtnRef}
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="flex h-full items-center justify-center px-4 py-4 text-sm font-medium text-gray-700 hover:bg-gray-50"
              aria-haspopup="true"
              aria-expanded={menuOpen}
              aria-label="More navigation options"
            >
              &#8942;
            </button>
          </li>
        )}
      </ul>

      {/* Three-dot dropdown */}
      {menuOpen && overflowItems.length > 0 && (
        <ul
          ref={dropdownRef}
          className="absolute right-0 top-full z-20 min-w-45 divide-y divide-gray-200 border border-gray-200 bg-white shadow-lg"
        >
          {overflowItems.map(({ label, href, icon, active }) => (
            <li key={href}>
              <Link
                href={href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-2 whitespace-nowrap px-4 py-3 text-sm font-medium hover:bg-gray-50 ${
                  active ? 'text-burgundy' : 'text-gray-700'
                }`}
              >
                <Image
                  src={icon}
                  alt=""
                  width={16}
                  height={16}
                  className="w-auto"
                />

                {label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
