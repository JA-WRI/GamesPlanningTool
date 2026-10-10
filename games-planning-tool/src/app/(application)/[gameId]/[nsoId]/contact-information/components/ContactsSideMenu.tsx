'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Users,
  CarFront,
  PlaneLanding,
  LucideIcon,
  Star,
  FlaskConical,
} from 'lucide-react';

interface MenuItem {
  label: string;
  slug: string;
  icon: LucideIcon;
}

const navItems: MenuItem[] = [
  { label: 'Home', slug: '', icon: Home },
  { label: 'COC Contacts', slug: 'coc', icon: Star },
  { label: 'NSO Contacts', slug: 'nso', icon: Users },
  { label: 'Games Transport Information', slug: 'transport', icon: CarFront },
  { label: 'PGTC Information and Arrivals', slug: 'pgtc', icon: PlaneLanding },
  { label: 'Test', slug: 'test', icon: FlaskConical }, // to be deleted after feature is checked
];

export default function ContactsSideMenu() {
  const pathname = usePathname();

  // Extracting dynamic ids from the URL path
  const [, gameId, nsoId] = pathname.split('/');

  // The vase path adapts to whichever gameId and nsoId are present
  const basePath = `/${gameId}/${nsoId}/contact-information`;

  return (
    <aside className="w-full md:w-16 xl:w-[23.9%] shrink-0 border-b md:border-b-0 md:border-r border-gray-200 bg-white transition-all">
      <nav
        aria-label="Main Navigation"
        className="flex flex-row md:flex-col justify-between md:justify-start overflow-x-auto md:overflow-x-visible"
      >
        {navItems.map((item) => {
          const Icon = item.icon;

          const href = item.slug ? `${basePath}/${item.slug}` : basePath;

          const isActive =
            item.slug === '' ? pathname === href : pathname.startsWith(href);

          const borderStyle = isActive
            ? 'border-burgundy bg-gray-100 font-semibold text-gray-900'
            : 'border-transparent text-gray-700 hover:bg-gray-50';

          return (
            <Link
              key={item.slug || 'home'}
              href={href}
              title={item.label}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-1 md:flex-none items-center justify-center xl:justify-start gap-3 px-3 xl:px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors ${borderStyle}`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="hidden xl:inline">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
