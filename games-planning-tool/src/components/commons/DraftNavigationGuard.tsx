// AI contribution: Above50% AI-generated
'use client';

import { useEffect, useRef } from 'react';
import {
  flushActiveDrafts,
  hasUnsavedDraftChanges,
} from '@/lib/draft-navigation';

export default function DraftNavigationGuard() {
  const isNavigating = useRef(false);
  const replayingClick = useRef(false);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (
        replayingClick.current ||
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

      if (!hasUnsavedDraftChanges()) return;
      event.preventDefault();
      event.stopPropagation();
      if (isNavigating.current) return;
      isNavigating.current = true;

      const resumeNavigation = () => {
        if (!anchor.isConnected) return;
        replayingClick.current = true;
        try {
          anchor.click();
        } finally {
          replayingClick.current = false;
        }
      };
      void flushActiveDrafts()
        .then(resumeNavigation)
        .catch(() => {
          if (
            window.confirm(
              'A draft could not be saved. Leave this page and risk losing recent edits?',
            )
          ) {
            resumeNavigation();
          }
        })
        .finally(() => {
          isNavigating.current = false;
        });
    };

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!hasUnsavedDraftChanges()) return;
      event.preventDefault();
      event.returnValue = true;
    };

    document.addEventListener('click', handleClick, true);
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      document.removeEventListener('click', handleClick, true);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return null;
}
