// More than 50% AI generated
'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

/* Warns before leaving a Game setup step that has unsaved changes.

  Wraps the setup view in the [gameId] layout. The current step's
  ConfigSectionCard reports whether it has unsaved changes; while it does,
  any link click (stepper, All Games, navbar, header) is stopped and the
  Admin is asked to keep editing or discard. Reload / closing the tab gets the
  browser's own "Leave site?" prompt.
*/

type UnsavedStep = {
  onDiscard?: () => void; // restores the last saved values
};

type ContextValue = {
  setUnsavedStep: (step: UnsavedStep | null) => void;
};

const UnsavedChangesContext = createContext<ContextValue | null>(null);

// Called by ConfigSectionCard. Does nothing outside an UnsavedChangesGuard.
export function useUnsavedChangesWarning(
  isDirty: boolean,
  onDiscard?: () => void,
) {
  const context = useContext(UnsavedChangesContext);
  const setUnsavedStep = context?.setUnsavedStep;

  // Keep the latest onDiscard without re-registering on every render
  const onDiscardRef = useRef(onDiscard);
  useEffect(() => {
    onDiscardRef.current = onDiscard;
  });

  useEffect(() => {
    if (!setUnsavedStep || !isDirty) return;
    setUnsavedStep({ onDiscard: () => onDiscardRef.current?.() });
    return () => setUnsavedStep(null);
  }, [setUnsavedStep, isDirty]);
}

// Same rules as DraftNavigationGuard: only plain left clicks on same-site links
// that go somewhere else.
function leavingLink(event: MouseEvent): HTMLAnchorElement | null {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return null;
  }
  const target = event.target;
  if (!(target instanceof Element)) return null;
  const anchor = target.closest('a[href]');
  if (
    !(anchor instanceof HTMLAnchorElement) ||
    anchor.hasAttribute('download') ||
    (anchor.target !== '' && anchor.target !== '_self')
  ) {
    return null;
  }
  const destination = new URL(anchor.href, window.location.href);
  if (
    destination.origin !== window.location.origin ||
    (destination.pathname === window.location.pathname &&
      destination.search === window.location.search)
  ) {
    return null;
  }
  return anchor;
}

export default function UnsavedChangesGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  // Ref, so the document listeners always see the current step
  const unsavedStep = useRef<UnsavedStep | null>(null);
  const replayingClick = useRef(false);
  const [blockedLink, setBlockedLink] = useState<HTMLAnchorElement | null>(
    null,
  );

  const setUnsavedStep = useCallback((step: UnsavedStep | null) => {
    unsavedStep.current = step;
  }, []);
  const contextValue = useMemo(() => ({ setUnsavedStep }), [setUnsavedStep]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (replayingClick.current || !unsavedStep.current) return;
      const anchor = leavingLink(event);
      if (!anchor) return;
      event.preventDefault();
      event.stopPropagation();
      setBlockedLink(anchor);
    };

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!unsavedStep.current) return;
      // Shows the browser's "Leave site?" prompt
      event.preventDefault();
    };

    // Capture phase, so this runs before Next's <Link> navigates
    document.addEventListener('click', handleClick, true);
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      document.removeEventListener('click', handleClick, true);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const keepEditing = () => setBlockedLink(null);

  const discardAndLeave = () => {
    const anchor = blockedLink;
    setBlockedLink(null);
    unsavedStep.current?.onDiscard?.();
    unsavedStep.current = null;
    if (!anchor?.isConnected) return;
    // Click the original link again so Next's <Link> navigates as usual
    replayingClick.current = true;
    try {
      anchor.click();
    } finally {
      replayingClick.current = false;
    }
  };

  return (
    <UnsavedChangesContext.Provider value={contextValue}>
      {children}
      <Dialog
        open={blockedLink !== null}
        onClose={keepEditing}
        aria-labelledby="unsaved-changes-title"
        aria-describedby="unsaved-changes-description"
      >
        <DialogTitle id="unsaved-changes-title" sx={{ fontWeight: 600 }}>
          You have unsaved changes
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="unsaved-changes-description">
            If you leave this step now, your changes will be lost. Save them
            first, or discard them to continue.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={discardAndLeave}
            variant="outlined"
            sx={{
              textTransform: 'none',
              color: 'var(--color-foreground, #2b2428)',
              borderColor: 'var(--color-muted, #6f666b)',
              '&:hover': {
                borderColor: 'var(--color-foreground, #2b2428)',
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            Discard changes
          </Button>
          <Button
            onClick={keepEditing}
            variant="contained"
            autoFocus
            sx={{
              textTransform: 'none',
              backgroundColor: 'var(--color-ocean, #238db2)',
            }}
          >
            Keep editing
          </Button>
        </DialogActions>
      </Dialog>
    </UnsavedChangesContext.Provider>
  );
}
