'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { flushActiveDrafts } from '@/lib/draft-navigation';

export default function DraftNavigationGuard() {
  const router = useRouter();
  const isNavigating = useRef(false);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest('a[href]');
      if (
        !(anchor instanceof HTMLAnchorElement) ||
        anchor.hasAttribute('download') ||
        (anchor.target !== '' && anchor.target !== '_self')
      ) {
        return;
      }

      const destination = new URL(anchor.href, window.location.href);
      if (
        destination.origin !== window.location.origin ||
        (destination.pathname === window.location.pathname &&
          destination.search === window.location.search)
      ) {
        return;
      }

      event.preventDefault();
      if (isNavigating.current) return;
      isNavigating.current = true;

      const href = `${destination.pathname}${destination.search}${destination.hash}`;
      void flushActiveDrafts()
        .then(() => router.push(href))
        .catch(() => {
          if (
            window.confirm(
              'A draft could not be saved. Leave this page and risk losing recent edits?',
            )
          ) {
            router.push(href);
          }
        })
        .finally(() => {
          isNavigating.current = false;
        });
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [router]);

  return null;
}
