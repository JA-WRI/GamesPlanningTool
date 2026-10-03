//60% AI to create the 3 dot overflow view of the navbar.
'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { usePathname, useParams, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Role } from '@/lib/types';
import { Games, Nsos } from '@/lib/data';
import { tabRoute, isActive } from '@/lib/routing/Navigation';
import {
  countVisibleItems,
  moveActiveIntoView,
} from '@/lib/routing/NavOverflow';

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

// Layout constants used by the overflow calculation.
const BUFFER = 4;
const FALLBACK_MORE_WIDTH = 48;

// Icon + label, shared by the visible tabs, the dropdown, and the measuring row.
function NavLabel({ icon, label }: { icon: string; label: string }) {
  return (
    <>
      <Image src={icon} alt="" width={13} height={13} className="w-auto" />
      {label}
    </>
  );
}

const tabBorder = (active: boolean) =>
  active ? 'border-b-4 border-burgundy' : 'border-b-4 border-transparent';

export default function Navbar({
  role,
  userNsoId,
}: {
  role: Role;
  userNsoId?: string;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { nsoId, gameId } = useParams<{ nsoId?: string; gameId?: string }>();

  const game = gameId ?? Games[0].id;
  const pickedNso = nsoId ?? searchParams.get('nso');
  const nso =
    role === 'nso' ? (userNsoId ?? Nsos[0].id) : (pickedNso ?? Nsos[0].id);

  // Only show navigation items allowed for the current role.
  const items = navItems
    .filter((item) => item.roles.includes(role))
    .map(({ label, path, icon }) => {
      const { route, href } = tabRoute(path, {
        role,
        game,
        nso,
        picked: pickedNso,
      });
      return { label, path, icon, href, active: isActive(pathname, route) };
    });

  const itemCount = items.length;
  const activeIndex = items.findIndex((item) => item.active);

  // Refs used to measure how much space each item needs.
  const containerRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const moreBtnMeasureRef = useRef<HTMLButtonElement>(null);

  const [visibleCount, setVisibleCount] = useState(itemCount);
  // Stays false until the first measurement, so the server-rendered (unmeasured)
  // navbar is never visible.
  const [measured, setMeasured] = useState(false);

  const routeKey = `${pathname}?${searchParams.toString()}`;
  const [menuOpen, setMenuOpen] = useState(false);
  const [lastRouteKey, setLastRouteKey] = useState(routeKey);

  // Close the menu whenever the route changes (link click, Back/Forward, etc.).
  // Setting state during render is React's recommended way to reset state when
  // a value changes, and it avoids an extra effect.
  if (lastRouteKey !== routeKey) {
    setLastRouteKey(routeKey);
    setMenuOpen(false);
  }

  // Work out how many items fit; the rest go into the three-dot menu.
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const recalculate = () => {
      // Measured widths already include each item's divider border.
      const widths = Array.from(
        { length: itemCount },
        (_, i) => itemRefs.current[i]?.getBoundingClientRect().width ?? 0,
      );

      setVisibleCount(
        countVisibleItems({
          widths,
          available: container.clientWidth - BUFFER,
          moreWidth:
            moreBtnMeasureRef.current?.offsetWidth ?? FALLBACK_MORE_WIDTH,
          activeIndex,
        }),
      );
      setMeasured(true);
    };

    recalculate();

    // Also covers window resizes, since the container is fluid.
    const observer = new ResizeObserver(recalculate);
    observer.observe(container);
    return () => observer.disconnect();
  }, [itemCount, activeIndex]);

  // Close the three-dot menu on outside click or Escape.
  useEffect(() => {
    if (!menuOpen) return;

    const handleMouseDown = (event: MouseEvent) => {
      if (!(event.target as Element).closest('[data-more-menu]')) {
        setMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  // If the active tab would be hidden, move it into the last visible slot.
  const ordered = moveActiveIntoView(items, activeIndex, visibleCount);

  const shownItems = ordered.slice(0, visibleCount);
  const overflowItems = ordered.slice(visibleCount);
  const hasOverflow = overflowItems.length > 0;

  return (
    <nav aria-label="Main" className="relative border-b border-gray-200">
      {/* Hidden row used only to measure the natural width of each item. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 invisible overflow-hidden"
      >
        <ul className="flex w-max divide-x divide-gray-200">
          {items.map(({ label, path, icon }, index) => (
            <li
              key={path}
              ref={(element) => {
                itemRefs.current[index] = element;
              }}
              className="shrink-0"
            >
              <span className="flex items-center justify-center gap-2 whitespace-nowrap px-20 py-3 text-sm font-medium">
                <NavLabel icon={icon} label={label} />
              </span>
            </li>
          ))}

          <li className="shrink-0">
            <button
              ref={moreBtnMeasureRef}
              type="button"
              tabIndex={-1}
              className="flex h-full items-center justify-center px-4 py-3 text-sm font-medium"
            >
              &#8942;
            </button>
          </li>
        </ul>
      </div>

      {/* Actual navbar */}
      <ul
        ref={containerRef}
        className={`flex divide-x divide-gray-200 overflow-hidden ${
          measured ? '' : 'invisible'
        }`}
      >
        {shownItems.map(({ label, path, href, icon, active }) => (
          <li key={path} className="flex flex-1 shrink-0">
            <Link
              href={href}
              aria-current={active ? 'page' : undefined}
              className={`flex flex-1 items-center justify-center gap-2 whitespace-nowrap px-20 py-3 text-sm font-medium hover:bg-gray-50 ${tabBorder(active)}`}
            >
              <NavLabel icon={icon} label={label} />
            </Link>
          </li>
        ))}

        {hasOverflow && (
          <li className="shrink-0">
            <button
              data-more-menu
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="flex h-full items-center justify-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
              aria-expanded={menuOpen}
              aria-label="More navigation options"
            >
              &#8942;
            </button>
          </li>
        )}
      </ul>

      {/* Three-dot dropdown */}
      {menuOpen && hasOverflow && (
        <ul
          data-more-menu
          className="absolute right-0 top-full z-20 min-w-45 divide-y divide-gray-200 border border-gray-200 bg-white shadow-lg"
        >
          {overflowItems.map(({ label, path, href, icon, active }) => (
            <li key={path}>
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-2 whitespace-nowrap px-4 py-3 text-sm font-medium hover:bg-gray-50 ${tabBorder(active)}`}
              >
                <NavLabel icon={icon} label={label} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
