// This page has been coded by both me and AI (50%).
// I started coding the general structure of the component and used AI to accelerate the process and get the right placement of elements
import type { ReactNode } from 'react';

type DashboardPanelProps = {
  id: string;
  title: string;
  children: ReactNode;
  className?: string;
};

export default function DashboardPanel({
  id,
  title,
  children,
  className = '',
}: DashboardPanelProps) {
  return (
    <section
      aria-labelledby={id}
      className={`min-w-0 rounded-xl border border-muted/30 bg-surface p-5 ${className}`}
    >
      <h2 id={id} className="text-base font-bold text-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}
