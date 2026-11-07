import { Suspense } from 'react';
import AppChrome from '@/components/layout/AppChrome';
import HeaderSkeleton from '@/components/layout/HeaderSkeleton';

// Kept synchronous on purpose: anything reading cookies/the DB here would block
// the whole screen (loading.tsx can't cover its own layout). The header/nav data
// loads inside <Suspense>, and pages below show loading.tsx while they load.
export default function ApplicationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Suspense fallback={<HeaderSkeleton />}>
        <AppChrome />
      </Suspense>
      <main className="page-container p-4">{children}</main>
    </>
  );
}
