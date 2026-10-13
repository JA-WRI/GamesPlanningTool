// Made with AI agents (Antigravity)
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Resource, FolderResource } from '@/types/resource';
import {
  reorderListWithInjection,
  isPointInsidePanel,
} from './folderModalDragHelpers';

export interface UseFolderModalDragProps {
  isReadOnly?: boolean;
  allResources: Resource[];
  currentFolderId: string;
  onMoveResourceToFolder: (
    resourceIds: string[],
    targetFolderId: string | null,
  ) => void;
  onReorderInFolder: (updatedChildren: Resource[]) => void;
  onDropOnMainPage?: (ids: string[], targetId: string | null) => void;
  onPointerHoverMainPage?: (
    clientX: number,
    clientY: number,
    ids: string[],
    isDrop?: boolean,
  ) => void;
  onClose: () => void;
  setCurrentFolderId: React.Dispatch<React.SetStateAction<string | null>>;
  setIsEditingFolder: React.Dispatch<React.SetStateAction<boolean>>;
  selectedIds: Set<string>;
  setLocalOrderedChildren: React.Dispatch<React.SetStateAction<Resource[]>>;
  localOrderedRef: React.MutableRefObject<Resource[]>;
}

export function useFolderModalDrag({
  isReadOnly,
  allResources,
  currentFolderId,
  onMoveResourceToFolder,
  onReorderInFolder,
  onDropOnMainPage,
  onPointerHoverMainPage,
  onClose,
  setCurrentFolderId,
  setIsEditingFolder,
  selectedIds,
  setLocalOrderedChildren,
  localOrderedRef,
}: UseFolderModalDragProps) {
  const [isDraggingOutside, setIsDraggingOutside] = useState(false);
  const [hasExitedWindow, setHasExitedWindow] = useState(false);
  const hasExitedWindowRef = useRef(false);
  const hasEnteredWindowRef = useRef(false);

  const [pointerDragIds, setPointerDragIds] = useState<string[]>([]);
  const ghostRef = useRef<HTMLDivElement>(null);
  const [dropTargetFolderId, setDropTargetFolderId] = useState<string | null>(
    null,
  );
  const [pointerDropTarget, setPointerDropTarget] = useState<string | null>(
    null,
  );
  const pointerDragRef = useRef<{
    ids: string[];
    startX: number;
    startY: number;
    started: boolean;
  } | null>(null);

  const draggedCardIdRef = useRef<string | null>(null);
  const isDraggingOutsideRef = useRef(false);
  const springTimerRef = useRef<NodeJS.Timeout | null>(null);

  const justDraggedRef = useRef(false);
  const lastNavigatedRef = useRef(0);
  const deadDropTargetRef = useRef<string | null>(null);
  const pointerDropTargetRef = useRef<string | null>(null);
  const dropTargetFolderIdRef = useRef<string | null>(null);
  const modalWrapperRef = useRef<HTMLDivElement>(null);
  const modalPanelRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const pointerMoveHandlerRef = useRef<(e: PointerEvent) => void>(() => {});
  const pointerUpHandlerRef = useRef<(e: PointerEvent) => void>(() => {});

  const clearSpringTimer = useCallback(() => {
    if (springTimerRef.current) {
      clearTimeout(springTimerRef.current);
      springTimerRef.current = null;
    }
  }, []);

  const clearDropTargets = useCallback(() => {
    setDropTargetFolderId(null);
    dropTargetFolderIdRef.current = null;
    setPointerDropTarget(null);
    pointerDropTargetRef.current = null;
  }, []);

  const stablePointerMove = useCallback((e: PointerEvent) => {
    pointerMoveHandlerRef.current(e);
  }, []);
  const stablePointerUp = useCallback((e: PointerEvent) => {
    pointerUpHandlerRef.current(e);
  }, []);

  const handleReorderInject = useCallback(
    (
      clientX: number,
      targetId: string,
      draggedIds: string[],
      rect: DOMRect,
    ) => {
      setLocalOrderedChildren((currentList) => {
        const updated = reorderListWithInjection(
          currentList,
          allResources,
          draggedIds,
          targetId,
          clientX,
          rect,
        );
        localOrderedRef.current = updated;
        return updated;
      });
    },
    [allResources, setLocalOrderedChildren, localOrderedRef],
  );

  useEffect(() => {
    pointerMoveHandlerRef.current = (e: PointerEvent) => {
      const drag = pointerDragRef.current;
      if (!drag) return;
      if (!drag.started) {
        const dx = e.clientX - drag.startX;
        const dy = e.clientY - drag.startY;
        if (Math.abs(dx) + Math.abs(dy) < 5) return;
        drag.started = true;
        setIsEditingFolder(true);
        setPointerDragIds(drag.ids);
        draggedCardIdRef.current = drag.ids[0];
      }
      if (ghostRef.current) {
        ghostRef.current.style.transform = `translate(${e.clientX + 12}px, ${e.clientY - 12}px)`;
      }

      const isInsidePanel = hasExitedWindowRef.current
        ? false
        : isPointInsidePanel(modalPanelRef.current, e.clientX, e.clientY);

      if (drag.started) {
        if (isInsidePanel && !hasEnteredWindowRef.current) {
          hasEnteredWindowRef.current = true;
        }

        if (
          !isInsidePanel &&
          hasEnteredWindowRef.current &&
          !isDraggingOutsideRef.current
        ) {
          isDraggingOutsideRef.current = true;
          setIsDraggingOutside(true);
          setHasExitedWindow(true);
          hasExitedWindowRef.current = true;
        } else if (
          isInsidePanel &&
          isDraggingOutsideRef.current &&
          !hasExitedWindowRef.current
        ) {
          isDraggingOutsideRef.current = false;
          setIsDraggingOutside(false);
          onPointerHoverMainPage?.(-1, -1, []);
        }
      }

      const elem = document.elementFromPoint(e.clientX, e.clientY);
      if (!elem) return;

      if (isDraggingOutsideRef.current) {
        const targetElem = elem.closest('[data-resource-id]');
        const targetId = targetElem?.getAttribute('data-resource-id');
        if (targetId) {
          setPointerDropTarget(targetId);
          pointerDropTargetRef.current = targetId;
        } else {
          setPointerDropTarget('__backdrop__');
          pointerDropTargetRef.current = '__backdrop__';
        }
        setDropTargetFolderId(null);
        dropTargetFolderIdRef.current = null;
        clearSpringTimer();
        onPointerHoverMainPage?.(e.clientX, e.clientY, drag.ids);
        return;
      }

      const backArrow = elem.closest('[data-folder-nav="back"]');
      if (backArrow && !backArrow.hasAttribute('disabled')) {
        if (deadDropTargetRef.current === '__back__') {
          setPointerDropTarget(null);
          pointerDropTargetRef.current = null;
          setDropTargetFolderId(null);
          dropTargetFolderIdRef.current = null;
        } else {
          setPointerDropTarget('__back__');
          pointerDropTargetRef.current = '__back__';
          setDropTargetFolderId(null);
          dropTargetFolderIdRef.current = null;
          if (!springTimerRef.current) {
            backArrow.classList.add('bg-white/30', 'scale-110');
            springTimerRef.current = setTimeout(() => {
              springTimerRef.current = null;
              lastNavigatedRef.current = Date.now();
              deadDropTargetRef.current = '__back__';
              setCurrentFolderId((prevId) => {
                const curFolder = allResources.find((r) => r.id === prevId) as
                  FolderResource | undefined;
                if (curFolder?.parentId) return curFolder.parentId;
                return prevId;
              });
            }, 800);
          }
          return;
        }
      } else {
        const backBtn = modalPanelRef.current?.querySelector(
          '[data-folder-nav="back"]',
        );
        backBtn?.classList.remove('bg-white/30', 'scale-110');
        if (deadDropTargetRef.current === '__back__')
          deadDropTargetRef.current = null;
      }

      const breadcrumbEl = elem.closest('[data-breadcrumb-id]');
      if (breadcrumbEl) {
        const bcId = breadcrumbEl.getAttribute('data-breadcrumb-id');
        if (deadDropTargetRef.current === `__breadcrumb__${bcId}`) {
          setPointerDropTarget(null);
          pointerDropTargetRef.current = null;
          setDropTargetFolderId(null);
          dropTargetFolderIdRef.current = null;
        } else {
          setPointerDropTarget(`__breadcrumb__${bcId}`);
          pointerDropTargetRef.current = `__breadcrumb__${bcId}`;
          setDropTargetFolderId(null);
          dropTargetFolderIdRef.current = null;
          if (!springTimerRef.current && bcId) {
            breadcrumbEl.classList.add('bg-white/30', 'rounded', 'px-1');
            springTimerRef.current = setTimeout(() => {
              springTimerRef.current = null;
              lastNavigatedRef.current = Date.now();
              deadDropTargetRef.current = `__breadcrumb__${bcId}`;
              setCurrentFolderId(bcId);
            }, 800);
          }
          return;
        }
      } else {
        modalPanelRef.current
          ?.querySelectorAll('[data-breadcrumb-id]')
          .forEach((el) => {
            el.classList.remove('bg-white/30', 'rounded', 'px-1');
          });
        if (deadDropTargetRef.current?.startsWith('__breadcrumb__'))
          deadDropTargetRef.current = null;
      }

      const targetCard = elem.closest('[data-folder-item-id]');
      if (!targetCard) {
        clearSpringTimer();
        clearDropTargets();
        return;
      }

      const targetId = targetCard.getAttribute('data-folder-item-id');
      const targetType = targetCard.getAttribute('data-resource-type');

      if (!targetId || drag.ids.includes(targetId)) {
        clearSpringTimer();
        clearDropTargets();
        return;
      }

      if (targetType === 'folder') {
        const isSelfOrDescendant = (folderId: string): boolean => {
          if (drag.ids.includes(folderId)) return true;
          const targetItem = allResources.find((r) => r.id === folderId);
          if (targetItem?.parentId)
            return isSelfOrDescendant(targetItem.parentId);
          return false;
        };

        if (isSelfOrDescendant(targetId)) {
          clearSpringTimer();
          clearDropTargets();
          return;
        }

        if (deadDropTargetRef.current === targetId) {
          clearDropTargets();
          return;
        }

        setDropTargetFolderId(targetId);
        dropTargetFolderIdRef.current = targetId;

        if (!springTimerRef.current) {
          springTimerRef.current = setTimeout(() => {
            springTimerRef.current = null;
            lastNavigatedRef.current = Date.now();
            deadDropTargetRef.current = targetId;
            setCurrentFolderId(targetId);
            clearDropTargets();
          }, 800);
        }
        return;
      }

      clearSpringTimer();
      clearDropTargets();

      if (drag.ids.length === 1 && selectedIds.size === 0) {
        const rect = targetCard.getBoundingClientRect();
        handleReorderInject(e.clientX, targetId, drag.ids, rect);
      }
    };

    pointerUpHandlerRef.current = (e: PointerEvent) => {
      const drag = pointerDragRef.current;
      if (!drag || !drag.started) {
        pointerDragRef.current = null;
        return;
      }

      const isInsidePanel = isPointInsidePanel(
        modalPanelRef.current,
        e.clientX,
        e.clientY,
      );

      clearSpringTimer();

      if (!isInsidePanel) {
        const elem = document.elementFromPoint(e.clientX, e.clientY);
        const targetElem = elem?.closest('[data-resource-id]');
        const targetId = targetElem?.getAttribute('data-resource-id');

        onDropOnMainPage?.(drag.ids, targetId || null);
        onPointerHoverMainPage?.(-1, -1, [], true);
        onClose();

        draggedCardIdRef.current = null;
        setPointerDragIds([]);
        pointerDragRef.current = null;
        isDraggingOutsideRef.current = false;
        setIsDraggingOutside(false);
        setPointerDropTarget(null);
        pointerDropTargetRef.current = null;
        return;
      }

      let handled = false;
      const justNavigated = Date.now() - lastNavigatedRef.current < 500;

      let activePointerTarget = pointerDropTargetRef.current;
      if (activePointerTarget === deadDropTargetRef.current)
        activePointerTarget = null;
      let activeFolderTarget = dropTargetFolderIdRef.current;
      if (activeFolderTarget === deadDropTargetRef.current)
        activeFolderTarget = null;

      if (!justNavigated && activePointerTarget?.startsWith('__breadcrumb__')) {
        const bcId = activePointerTarget.replace('__breadcrumb__', '');
        onMoveResourceToFolder(drag.ids, bcId);
        setIsEditingFolder(false);
        handled = true;
      } else if (!justNavigated && activePointerTarget === '__back__') {
        const curFolder = allResources.find((r) => r.id === currentFolderId) as
          FolderResource | undefined;
        onMoveResourceToFolder(drag.ids, curFolder?.parentId || null);
        setIsEditingFolder(false);
        handled = true;
      }

      if (!handled) {
        if (activePointerTarget === '__backdrop__') {
          onMoveResourceToFolder(drag.ids, null);
          setIsEditingFolder(false);
        } else if (activeFolderTarget) {
          onMoveResourceToFolder(drag.ids, activeFolderTarget);
          setIsEditingFolder(false);
        } else {
          const existingIds = new Set(localOrderedRef.current.map((r) => r.id));
          const itemsToAdd = drag.ids
            .filter((id) => !existingIds.has(id))
            .map((id) => allResources.find((r) => r.id === id))
            .filter(Boolean) as Resource[];

          const combined = [...localOrderedRef.current, ...itemsToAdd];
          const updatedChildren = combined.map((r) =>
            drag.ids.includes(r.id)
              ? { ...r, parentId: currentFolderId || undefined }
              : r,
          );
          onReorderInFolder(updatedChildren);
          setIsEditingFolder(false);
        }
      }

      clearDropTargets();

      draggedCardIdRef.current = null;
      setPointerDragIds([]);
      pointerDragRef.current = null;
      justDraggedRef.current = true;
      setTimeout(() => {
        justDraggedRef.current = false;
      }, 100);
    };

    window.addEventListener('pointermove', stablePointerMove);
    window.addEventListener('pointerup', stablePointerUp);
    return () => {
      window.removeEventListener('pointermove', stablePointerMove);
      window.removeEventListener('pointerup', stablePointerUp);
      clearSpringTimer();
    };
  }, [
    stablePointerMove,
    stablePointerUp,
    allResources,
    currentFolderId,
    onMoveResourceToFolder,
    onReorderInFolder,
    clearSpringTimer,
    clearDropTargets,
    onDropOnMainPage,
    handleReorderInject,
    onClose,
    onPointerHoverMainPage,
    setIsEditingFolder,
    selectedIds,
    setCurrentFolderId,
    localOrderedRef,
  ]);

  const startPointerDrag = (e: React.PointerEvent, id: string) => {
    if (isReadOnly || e.button !== 0) return;
    const idsToDrag =
      selectedIds.size > 0 && selectedIds.has(id)
        ? Array.from(selectedIds)
        : [id];
    pointerDragRef.current = {
      ids: idsToDrag,
      startX: e.clientX,
      startY: e.clientY,
      started: false,
    };
    draggedCardIdRef.current = id;
    justDraggedRef.current = false;
    e.preventDefault();
  };

  const resetDragStates = () => {
    setHasExitedWindow(false);
    hasExitedWindowRef.current = false;
    hasEnteredWindowRef.current = false;
    setIsDraggingOutside(false);
    isDraggingOutsideRef.current = false;
  };

  return {
    isDraggingOutside,
    hasExitedWindow,
    pointerDragIds,
    ghostRef,
    dropTargetFolderId,
    pointerDropTarget,
    justDraggedRef,
    modalWrapperRef,
    modalPanelRef,
    contentRef,
    startPointerDrag,
    handleReorderInject,
    setDropTargetFolderId,
    dropTargetFolderIdRef,
    clearSpringTimer,
    springTimerRef,
    resetDragStates,
  };
}

export default useFolderModalDrag;
