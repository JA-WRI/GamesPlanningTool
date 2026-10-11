// Made with AI agents (Antigravity)
'use client';

import React, {
  useState,
  useMemo,
  useRef,
  useCallback,
  useEffect,
} from 'react';
import { Resource, FolderResource } from '@/types/resource';
import { getFolderChildren } from '@/lib/resources-data';
import { ResourceCard } from './ResourceCard';
import { useSweepSelection } from './useSweepSelection';
import { CategoryEditor } from './CategoryEditor';

interface FolderDirectoryModalProps {
  folder: FolderResource | null;
  allResources: Resource[];
  currentCategory: string;
  onClose: () => void;
  onSelectResourceDetail: (resource: Resource) => void;
  onCreateSubfolder: (name: string, parentFolderId: string) => void;
  onAddResourceToFolder: (parentFolderId: string) => void;
  onMoveResourceToFolder: (
    resourceIds: string[],
    targetFolderId: string | null,
  ) => void;
  onReorderInFolder: (orderedChildren: Resource[]) => void;
  onRenameResource?: (id: string, newName: string) => void;
  onDropOnMainPage?: (
    resourceIds: string[],
    targetResourceId: string | null,
  ) => void;
  onPointerHoverMainPage?: (
    clientX: number,
    clientY: number,
    draggedIds: string[],
    dropped?: boolean,
  ) => void;
  onDeleteResources?: (resourceIds: string[]) => void;
  onCategoriesChange?: (id: string, newCategories: string[]) => void;
  externalDraggedId?: string | null;
  isReadOnly?: boolean;
  filterPredicate?: (r: Resource) => boolean;
}

export function FolderDirectoryModal({
  folder,
  allResources,
  /* currentCategory, */
  onClose,
  onSelectResourceDetail,
  onCreateSubfolder,
  onAddResourceToFolder,
  onMoveResourceToFolder,
  onReorderInFolder,
  onRenameResource,
  onDropOnMainPage,
  onPointerHoverMainPage,
  onDeleteResources,
  onCategoriesChange,
  externalDraggedId,
  isReadOnly = false,
  filterPredicate,
}: FolderDirectoryModalProps) {
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(
    folder?.id || null,
  );
  const [isEditingFolder, setIsEditingFolder] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [editNameValue, setEditNameValue] = useState('');
  const [isEditingCategories, setIsEditingCategories] = useState(false);
  const committedRef = useRef(false);

  const currentFolder = allResources.find((r) => r.id === currentFolderId) as
    FolderResource | undefined;
  const rawChildren = useMemo(() => {
    let children = currentFolder
      ? getFolderChildren(allResources, currentFolder.id)
      : [];
    if (filterPredicate) {
      children = children.filter(filterPredicate);
    }
    return children;
  }, [currentFolder, allResources, filterPredicate]);

  const [localOrderedChildren, setLocalOrderedChildren] =
    useState<Resource[]>(rawChildren);
  const localOrderedRef = useRef<Resource[]>(rawChildren);

  const [isDraggingOutside, setIsDraggingOutside] = useState(false);
  const [hasExitedWindow, setHasExitedWindow] = useState(false);
  const hasExitedWindowRef = useRef(false);
  const hasEnteredWindowRef = useRef(false);
  useEffect(() => {
    if (folder?.id && currentFolderId !== folder.id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentFolderId(folder.id);
    }
    if (folder?.id) {
      setIsEditingCategories(false);
    }
    setHasExitedWindow(false);
    hasExitedWindowRef.current = false;
    hasEnteredWindowRef.current = false;
    setIsDraggingOutside(false);
    isDraggingOutsideRef.current = false;
    setIsEditingFolder(false);
  }, [folder, currentFolderId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalOrderedChildren(rawChildren);
    localOrderedRef.current = rawChildren;
  }, [rawChildren]);

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
      const sourceId = draggedIds[0];
      const midX = rect.left + rect.width / 2;

      setLocalOrderedChildren((currentList) => {
        const targetIdx = currentList.findIndex((r) => r.id === targetId);
        if (targetIdx === -1) return currentList;

        const sourceIdx = currentList.findIndex((r) => r.id === sourceId);
        if (sourceIdx !== -1) {
          if (sourceIdx === targetIdx) return currentList;
          if (sourceIdx < targetIdx && clientX < midX) return currentList;
          if (sourceIdx > targetIdx && clientX > midX) return currentList;
        }

        const itemsToMove = draggedIds
          .map(
            (id) =>
              currentList.find((r) => r.id === id) ||
              allResources.find((r) => r.id === id),
          )
          .filter(Boolean) as Resource[];
        if (itemsToMove.length === 0) return currentList;

        const filtered = currentList.filter((r) => !draggedIds.includes(r.id));
        let newTargetIdx = filtered.findIndex((r) => r.id === targetId);
        if (newTargetIdx === -1) newTargetIdx = filtered.length;

        let insertAfter = false;
        if (sourceIdx !== -1) insertAfter = sourceIdx < targetIdx;
        else insertAfter = clientX > midX;

        if (insertAfter) newTargetIdx++;

        filtered.splice(newTargetIdx, 0, ...itemsToMove);
        localOrderedRef.current = filtered;
        return filtered;
      });
    },
    [allResources],
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

      let isInsidePanel = true;
      if (modalPanelRef.current && !hasExitedWindowRef.current) {
        const rect = modalPanelRef.current.getBoundingClientRect();
        isInsidePanel =
          e.clientX >= rect.left - 10 &&
          e.clientX <= rect.right + 10 &&
          e.clientY >= rect.top - 10 &&
          e.clientY <= rect.bottom + 10;
      } else if (hasExitedWindowRef.current) {
        isInsidePanel = false;
      }

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
        {
          setDropTargetFolderId(null);
          dropTargetFolderIdRef.current = null;
        }
        clearSpringTimer();
        onPointerHoverMainPage?.(e.clientX, e.clientY, drag.ids);
        return;
      }

      const backArrow = elem.closest('[data-folder-nav="back"]');
      if (backArrow && !backArrow.hasAttribute('disabled')) {
        if (deadDropTargetRef.current === '__back__') {
          {
            setPointerDropTarget(null);
            pointerDropTargetRef.current = null;
          }
          {
            setDropTargetFolderId(null);
            dropTargetFolderIdRef.current = null;
          }
        } else {
          {
            setPointerDropTarget('__back__');
            pointerDropTargetRef.current = '__back__';
          }
          {
            setDropTargetFolderId(null);
            dropTargetFolderIdRef.current = null;
          }
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
          {
            setPointerDropTarget(null);
            pointerDropTargetRef.current = null;
          }
          {
            setDropTargetFolderId(null);
            dropTargetFolderIdRef.current = null;
          }
        } else {
          {
            setPointerDropTarget(`__breadcrumb__${bcId}`);
            pointerDropTargetRef.current = `__breadcrumb__${bcId}`;
          }
          {
            setDropTargetFolderId(null);
            dropTargetFolderIdRef.current = null;
          }
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

      const folderItemEl = elem.closest('[data-folder-item-id]');
      const targetId =
        folderItemEl?.getAttribute('data-folder-item-id') || null;
      const targetType =
        folderItemEl?.getAttribute('data-resource-type') || null;

      if (targetId && targetType === 'folder' && !drag.ids.includes(targetId)) {
        const rect = folderItemEl!.getBoundingClientRect();
        const relativeX = (e.clientX - rect.left) / rect.width;
        if (relativeX >= 0.1 && relativeX <= 0.9) {
          if (deadDropTargetRef.current === targetId) {
            {
              setDropTargetFolderId(null);
              dropTargetFolderIdRef.current = null;
            }
            {
              setPointerDropTarget(null);
              pointerDropTargetRef.current = null;
            }
          } else {
            {
              setDropTargetFolderId(targetId);
              dropTargetFolderIdRef.current = targetId;
            }
            {
              setPointerDropTarget(targetId);
              pointerDropTargetRef.current = targetId;
            }
            if (!springTimerRef.current) {
              springTimerRef.current = setTimeout(() => {
                springTimerRef.current = null;
                lastNavigatedRef.current = Date.now();
                deadDropTargetRef.current = targetId;
                setCurrentFolderId(targetId);
                {
                  setDropTargetFolderId(null);
                  dropTargetFolderIdRef.current = null;
                }
              }, 800);
            }
            return;
          }
        } else {
          if (deadDropTargetRef.current === targetId)
            deadDropTargetRef.current = null;
        }
      } else {
        if (
          deadDropTargetRef.current &&
          !deadDropTargetRef.current.startsWith('__')
        )
          deadDropTargetRef.current = null;
      }

      {
        setDropTargetFolderId(null);
        dropTargetFolderIdRef.current = null;
      }
      {
        setPointerDropTarget(null);
        pointerDropTargetRef.current = null;
      }
      clearSpringTimer();

      if (targetId && !drag.ids.includes(targetId)) {
        const rect = folderItemEl!.getBoundingClientRect();
        handleReorderInject(e.clientX, targetId, drag.ids, rect);
      }
    };

    pointerUpHandlerRef.current = (e: PointerEvent) => {
      const drag = pointerDragRef.current;
      if (!drag || !drag.started) {
        pointerDragRef.current = null;
        return;
      }

      let isInsidePanel = true;
      if (modalPanelRef.current) {
        const rect = modalPanelRef.current.getBoundingClientRect();
        isInsidePanel =
          e.clientX >= rect.left - 10 &&
          e.clientX <= rect.right + 10 &&
          e.clientY >= rect.top - 10 &&
          e.clientY <= rect.bottom + 10;
      }

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
        {
          setPointerDropTarget(null);
          pointerDropTargetRef.current = null;
        }
        return;
      }

      let handled = false;
      // Prevent dropping on nav targets if the user JUST navigated (less than 500ms ago)
      // This happens if they hover the back button, the view navigates, and they immediately drop.
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

      {
        setPointerDropTarget(null);
        pointerDropTargetRef.current = null;
      }
      {
        setDropTargetFolderId(null);
        dropTargetFolderIdRef.current = null;
      }

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
    onDropOnMainPage,
    handleReorderInject,
    onClose,
    onPointerHoverMainPage,
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

  const getBreadcrumbs = () => {
    const breadcrumbs: { id: string; name: string }[] = [];
    let cur = currentFolder;
    while (cur) {
      breadcrumbs.unshift({ id: cur.id, name: cur.name });
      if (cur.parentId) {
        cur = allResources.find((r) => r.id === cur?.parentId) as
          FolderResource | undefined;
      } else {
        cur = undefined;
      }
    }
    return breadcrumbs;
  };

  const {
    handleSweepPointerDown,
    handleCardPointerDown,

    justFinishedSweepRef,
  } = useSweepSelection(
    localOrderedChildren,
    selectedIds,
    setSelectedIds,
    undefined,
    isEditingFolder,
    modalPanelRef,
  );
  if (!folder || !currentFolder) return null;

  const breadcrumbs = getBreadcrumbs();

  const handleCreateFolderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newFolderName.trim();
    if (trimmed && currentFolderId) {
      onCreateSubfolder(trimmed, currentFolderId);
    }
    setNewFolderName('');
    setIsCreatingFolder(false);
  };

  return (
    <>
      <div
        ref={modalWrapperRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="folder-directory-title"
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
          hasExitedWindow
            ? 'hidden'
            : isDraggingOutside
              ? 'opacity-20 pointer-events-none'
              : pointerDragIds.length > 0
                ? 'pointer-events-none'
                : ''
        }`}
      >
        <button
          type="button"
          tabIndex={-1}
          aria-label="Close dialog"
          className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in cursor-default border-none"
          onClick={onClose}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            e.dataTransfer.dropEffect = 'move';
            if (externalDraggedId) {
              if (dropTargetFolderIdRef.current !== '__backdrop__') {
                setDropTargetFolderId('__backdrop__');
                dropTargetFolderIdRef.current = '__backdrop__';
                clearSpringTimer();
                springTimerRef.current = setTimeout(() => {
                  springTimerRef.current = null;
                  onClose();
                }, 800);
              }
            }
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (isReadOnly) return;
            const draggedId = e.dataTransfer.getData('text/plain');
            if (draggedId) {
              onMoveResourceToFolder([draggedId], currentFolderId);
            }
          }}
        />
        <div
          ref={modalPanelRef}
          className={`relative w-full max-w-5xl h-[80vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden z-10 transition-all duration-300 ${
            hasExitedWindow
              ? 'hidden'
              : isDraggingOutside
                ? 'opacity-50 ring-4 ring-primary scale-95 pointer-events-none'
                : 'pointer-events-auto'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            e.dataTransfer.dropEffect = 'move';
            if (externalDraggedId) {
              const cardEl = (e.target as HTMLElement).closest(
                '[data-resource-id]',
              );
              const targetId = cardEl?.getAttribute('data-resource-id');
              const targetType = cardEl?.getAttribute('data-resource-type');
              if (targetId && targetId !== externalDraggedId) {
                if (targetType === 'folder') {
                  if (dropTargetFolderIdRef.current !== targetId) {
                    setDropTargetFolderId(targetId);
                    dropTargetFolderIdRef.current = targetId;
                    clearSpringTimer();
                    springTimerRef.current = setTimeout(() => {
                      springTimerRef.current = null;
                      setCurrentFolderId(targetId);
                      setDropTargetFolderId(null);
                      dropTargetFolderIdRef.current = null;
                    }, 800);
                  }
                  return;
                }

                if (dropTargetFolderIdRef.current !== null) {
                  clearSpringTimer();
                  setDropTargetFolderId(null);
                  dropTargetFolderIdRef.current = null;
                }
                const rect = cardEl!.getBoundingClientRect();
                handleReorderInject(
                  e.clientX,
                  targetId,
                  [externalDraggedId],
                  rect,
                );
              } else if (!targetId) {
                if (dropTargetFolderIdRef.current !== null) {
                  clearSpringTimer();
                  setDropTargetFolderId(null);
                  dropTargetFolderIdRef.current = null;
                }
              }
            }
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (isReadOnly) return;
            const draggedId = e.dataTransfer.getData('text/plain');
            if (draggedId) {
              const cardEl = (e.target as HTMLElement).closest(
                '[data-resource-id]',
              );
              let targetFolder = currentFolderId;
              if (cardEl) {
                const resId = cardEl.getAttribute('data-resource-id');
                const resType = cardEl.getAttribute('data-resource-type');
                if (resId && resType === 'folder') {
                  targetFolder = resId;
                }
              }
              if (
                targetFolder === currentFolderId &&
                localOrderedRef.current.some((r) => r.id === draggedId)
              ) {
                const updatedChildren = localOrderedRef.current.map((r) =>
                  r.id === draggedId
                    ? { ...r, parentId: targetFolder || undefined }
                    : r,
                );
                onReorderInFolder?.(updatedChildren);
              } else {
                onMoveResourceToFolder([draggedId], targetFolder);
              }
            }
          }}
        >
          <div className="relative bg-[#80131d] px-4 py-4 sm:px-6 sm:py-5 flex items-center shrink-0">
            <div className="flex items-center w-full pr-10">
              <button
                type="button"
                data-folder-nav="back"
                className={`p-1.5 mr-3 rounded-full text-white/80 transition-all ${currentFolder.parentId ? 'hover:bg-white/20 hover:text-white cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
                onClick={() => {
                  if (currentFolder.parentId)
                    setCurrentFolderId(currentFolder.parentId);
                }}
                disabled={!currentFolder.parentId}
                title="Go back (drag items here to move up)"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <div className="min-w-0 flex-1">
                {editingNameId === currentFolder.id ? (
                  <input
                    autoFocus
                    type="text"
                    value={editNameValue}
                    onChange={(e) => setEditNameValue(e.target.value)}
                    onBlur={() => {
                      if (committedRef.current) {
                        committedRef.current = false;
                        return;
                      }
                      const trimmed = editNameValue.trim();
                      if (trimmed && trimmed !== currentFolder.name)
                        onRenameResource?.(currentFolder.id, trimmed);
                      setEditingNameId(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        committedRef.current = true;
                        const trimmed = editNameValue.trim();
                        if (trimmed && trimmed !== currentFolder.name)
                          onRenameResource?.(currentFolder.id, trimmed);
                        setEditingNameId(null);
                      }
                      if (e.key === 'Escape') {
                        committedRef.current = true;
                        setEditingNameId(null);
                      }
                    }}
                    className="text-lg sm:text-xl font-bold bg-transparent text-white outline-none drop-shadow-xs w-full"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      borderBottom: '2px solid rgba(255,255,255,0.5)',
                      borderRadius: 0,
                      padding: 0,
                    }}
                  />
                ) : (
                  <h2
                    id="folder-directory-title"
                    className="text-lg sm:text-xl font-bold text-white truncate drop-shadow-xs cursor-pointer hover:underline decoration-white/50 underline-offset-4"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditNameValue(currentFolder.name);
                      setEditingNameId(currentFolder.id);
                    }}
                    title="Click to rename"
                  >
                    {currentFolder.name}
                  </h2>
                )}
                {breadcrumbs.length > 1 && (
                  <div className="flex items-center space-x-1.5 text-xs text-white/80 overflow-x-auto whitespace-nowrap mt-0.5">
                    {breadcrumbs.slice(0, -1).map((b, idx) => (
                      <React.Fragment key={b.id}>
                        {idx > 0 && <span>/</span>}
                        <button
                          type="button"
                          data-breadcrumb-id={b.id}
                          onClick={() => setCurrentFolderId(b.id)}
                          className="hover:underline cursor-pointer transition-all text-white/80"
                        >
                          {b.name}
                        </button>
                      </React.Fragment>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="absolute top-3 right-3 text-white/80 hover:text-white bg-black/40 hover:bg-black/60 rounded-full p-1.5 transition-colors cursor-pointer"
              aria-label="Close folder dialog"
            >
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          {!isReadOnly && (
            <div className="border-b border-neutral-200 bg-neutral-50 px-4 py-3 flex items-center justify-between shrink-0 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onAddResourceToFolder(currentFolder.id)}
                  className="px-3 py-1.5 text-xs font-semibold bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-100 rounded-md shadow-xs transition-colors cursor-pointer"
                >
                  + Add Resource
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreatingFolder(true)}
                  className="px-3 py-1.5 text-xs font-semibold bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-100 rounded-md shadow-xs transition-colors cursor-pointer"
                >
                  + Create Subfolder
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingCategories(!isEditingCategories)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md shadow-xs transition-colors cursor-pointer ${isEditingCategories ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' : 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-100'}`}
                >
                  Edit Categories
                </button>
              </div>

              <div className="flex items-center space-x-2 ml-auto">
                {isEditingFolder &&
                  selectedIds.size > 0 &&
                  onDeleteResources && (
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          window.confirm(
                            `Are you sure you want to delete ${selectedIds.size} selected item${selectedIds.size === 1 ? '' : 's'}?`,
                          )
                        ) {
                          onDeleteResources(Array.from(selectedIds));
                          setSelectedIds(new Set());
                          setIsEditingFolder(false);
                        }
                      }}
                      className="px-3 py-1.5 text-xs font-semibold rounded-md shadow-xs transition-colors flex items-center space-x-1 text-white bg-red-700 hover:bg-red-800 cursor-pointer"
                    >
                      Delete Selected ({selectedIds.size})
                    </button>
                  )}
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingFolder((prev) => !prev);
                    setSelectedIds(new Set());
                  }}
                  className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer shadow-xs ${isEditingFolder ? 'bg-[#80131d] hover:bg-[#600f16] text-white' : 'bg-[#374151] hover:bg-[#1f2937] text-white'}`}
                >
                  {isEditingFolder ? 'Done' : 'Edit'}
                </button>
              </div>
            </div>
          )}

          {isEditingCategories && (
            <div className="p-4 bg-indigo-50/50 border-b border-indigo-100 shrink-0">
              <CategoryEditor
                selectedCategories={currentFolder.categories}
                onChange={(newCats) =>
                  onCategoriesChange?.(currentFolder.id, newCats)
                }
              />
            </div>
          )}

          {isCreatingFolder && (
            <form
              onSubmit={handleCreateFolderSubmit}
              className="p-3 bg-amber-50 border-b border-amber-200 flex items-center space-x-2 shrink-0"
            >
              <input
                type="text"
                autoFocus
                placeholder="Subfolder name..."
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="text-xs bg-white border border-amber-300 rounded px-3 py-1.5 text-neutral-800 flex-1 focus:outline-hidden focus:ring-2 focus:ring-[#80131d]"
              />
              <button
                type="submit"
                className="px-3 py-1.5 text-xs font-semibold bg-[#80131d] hover:bg-[#600f16] text-white rounded cursor-pointer"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCreatingFolder(false);
                  setNewFolderName('');
                }}
                className="px-3 py-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 cursor-pointer"
              >
                Cancel
              </button>
            </form>
          )}

          <div
            ref={contentRef}
            className="p-4 sm:p-6 overflow-y-auto flex-1 bg-neutral-50/50"
          >
            {localOrderedChildren.length === 0 ? (
              <div className="text-center py-12 text-neutral-500 text-sm">
                <svg
                  className="w-12 h-12 mx-auto text-neutral-300 mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                  />
                </svg>
                <p>This folder is empty.</p>
                <p className="text-xs text-neutral-400 mt-1">
                  Add files or create subfolders using the actions above.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4 pt-2 pb-2 px-1 items-end">
                {localOrderedChildren.map((item) => {
                  const isSubfolder = item.type === 'folder';
                  const isDropTarget = dropTargetFolderId === item.id;
                  const isDraggingThis =
                    pointerDragIds.includes(item.id) ||
                    item.id === externalDraggedId;

                  return (
                    <div
                      key={item.id}
                      data-folder-item-id={item.id}
                      data-resource-type={item.type}
                      className={`shrink-0 transition-transform ${isDraggingThis ? 'opacity-40 scale-95' : ''}`}
                    >
                      <ResourceCard
                        resource={item}
                        isEditing={isEditingFolder}
                        isSelected={selectedIds.has(item.id)}
                        canReorder={selectedIds.size === 0}
                        canDrag={false}
                        isDraggingThisCard={isDraggingThis}
                        showRemovalSymbol={false}
                        isFolderDropTarget={isDropTarget}
                        itemCount={
                          isSubfolder
                            ? getFolderChildren(allResources, item.id).length
                            : undefined
                        }
                        onToggleSelect={(id) => {
                          if (justFinishedSweepRef.current) return;
                          setSelectedIds((prev) => {
                            const next = new Set(prev);
                            if (next.has(id)) next.delete(id);
                            else next.add(id);
                            return next;
                          });
                        }}
                        onRoundButtonPointerDown={(e) =>
                          handleSweepPointerDown(e.clientX, e.clientY, item.id)
                        }
                        onRoundButtonClick={(id) => {
                          if (justFinishedSweepRef.current) return;
                          setSelectedIds((prev) => {
                            const next = new Set(prev);
                            if (next.has(id)) next.delete(id);
                            else next.add(id);
                            return next;
                          });
                        }}
                        onCardPointerDown={(e) => {
                          handleCardPointerDown(e, item.id);
                          startPointerDrag(e, item.id);
                        }}
                        onClick={(resource) => {
                          if (justDraggedRef.current) return;
                          if (resource.type === 'folder')
                            setCurrentFolderId(resource.id);
                          else onSelectResourceDetail(resource);
                        }}
                        onRename={onRenameResource}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {pointerDragIds.length > 0 && (
        <div
          ref={ghostRef}
          className="fixed pointer-events-none flex flex-col items-start"
          style={{ left: 0, top: 0, zIndex: 9999, willChange: 'transform' }}
        >
          <div className="bg-[#80131d] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
            {pointerDragIds.length === 1
              ? allResources.find((r) => r.id === pointerDragIds[0])?.name ||
                '1 item'
              : `${pointerDragIds.length} items`}
          </div>
          {isDraggingOutside && pointerDropTarget === '__backdrop__' && (
            <div className="mt-2 text-xs font-bold text-white bg-black/70 px-2.5 py-1 rounded-full drop-shadow-md">
              Move to Main View
            </div>
          )}
        </div>
      )}
    </>
  );
}
export default FolderDirectoryModal;
