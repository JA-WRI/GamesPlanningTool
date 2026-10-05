// Made with AI agents (Antigravity)
'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Resource, FolderResource } from '@/types/resource';
import { getFolderChildren } from '@/lib/resources-data';
import { SearchPill } from './SearchPill';
import { ResourceCard } from './ResourceCard';

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
  onDropOnCategory?: (
    resourceIds: string[],
    targetCategory: string | null,
  ) => void;
  onDeleteResources?: (resourceIds: string[]) => void;
}

export function FolderDirectoryModal({
  folder,
  allResources,
  currentCategory,
  onClose,
  onSelectResourceDetail,
  onCreateSubfolder,
  onAddResourceToFolder,
  onMoveResourceToFolder,
  onReorderInFolder,
  onRenameResource,
  onDropOnCategory,
  onDeleteResources,
}: FolderDirectoryModalProps) {
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(
    folder?.id || null,
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isEditingFolder, setIsEditingFolder] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [dropTargetFolderId, setDropTargetFolderId] = useState<string | null>(
    null,
  );
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [editNameValue, setEditNameValue] = useState('');
  const committedRef = useRef(false);
  const springTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearSpringTimer = () => {
    if (springTimerRef.current) {
      clearTimeout(springTimerRef.current);
      springTimerRef.current = null;
    }
  };

  const contentRef = useRef<HTMLDivElement>(null);
  const modalPanelRef = useRef<HTMLDivElement>(null);
  const modalWrapperRef = useRef<HTMLDivElement>(null);
  const [localOrderedChildren, setLocalOrderedChildren] = useState<Resource[]>(
    [],
  );
  const localOrderedRef = useRef<Resource[]>([]);
  const draggedCardIdRef = useRef<string | null>(null);
  const filteredChildrenKey = useRef('');

  // Pointer-based drag state (survives DOM changes / folder navigation)
  const [pointerDragIds, setPointerDragIds] = useState<string[]>([]);
  const [ghostPos, setGhostPos] = useState<{ x: number; y: number } | null>(
    null,
  );
  const pointerDragRef = useRef<{
    ids: string[];
    startX: number;
    startY: number;
    started: boolean;
  } | null>(null);
  const [pointerDropTarget, setPointerDropTarget] = useState<string | null>(
    null,
  );
  const justDraggedRef = useRef(false);
  const [isDraggingOutside, setIsDraggingOutside] = useState(false);
  const isDraggingOutsideRef = useRef(false);

  // Cleanup spring timer on unmount
  useEffect(() => () => clearSpringTimer(), []);

  // Nothing to render if no folder — but hooks must run first
  const folder_ = folder;

  const currentFolder = folder_
    ? (allResources.find((r) => r.id === currentFolderId) as FolderResource) ||
      folder_
    : null;

  // Build breadcrumb chain from root folder down to currentFolder
  const breadcrumbs: { id: string; name: string }[] = [];
  if (currentFolder && folder_) {
    let curr: Resource | undefined = currentFolder;
    while (curr && curr.type === 'folder') {
      breadcrumbs.unshift({ id: curr.id, name: curr.name });
      if (!curr.parentId || curr.id === folder_.id) break;
      curr = allResources.find((r) => r.id === curr?.parentId);
    }
  }

  // Children of the current open folder in this directory
  const children = currentFolder
    ? getFolderChildren(allResources, currentFolder.id)
    : [];

  const filteredChildren = children.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.categories?.some((cat) => cat.toLowerCase().includes(q))
    );
  });

  const handleCreateFolderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim() || !currentFolder) return;
    onCreateSubfolder(newFolderName.trim(), currentFolder.id);
    setNewFolderName('');
    setIsCreatingFolder(false);
  };

  /* ── Local ordered state for visual reorder during drag ── */
  useEffect(() => {
    const newKey = filteredChildren.map((c) => c.id).join(',');
    if (newKey !== filteredChildrenKey.current) {
      filteredChildrenKey.current = newKey;
      setLocalOrderedChildren(filteredChildren);
      localOrderedRef.current = filteredChildren;
    }
  }, [filteredChildren]);

  /* ── Pointer-based drag system (survives DOM changes) ── */

  const getDraggedIds = (primaryId: string): string[] => {
    if (selectedIds.has(primaryId) && selectedIds.size > 1) {
      return Array.from(selectedIds);
    }
    return [primaryId];
  };

  const endPointerDrag = () => {
    const wasDragging = pointerDragRef.current?.started;
    pointerDragRef.current = null;
    setPointerDragIds([]);
    setGhostPos(null);

    setDropTargetFolderId(null);
    setPointerDropTarget(null);
    draggedCardIdRef.current = null;
    isDraggingOutsideRef.current = false;
    setIsDraggingOutside(false);
    clearSpringTimer();
    if (wasDragging) {
      justDraggedRef.current = true;
      requestAnimationFrame(() => {
        justDraggedRef.current = false;
      });
    }
  };

  // ─── Handler refs: updated every render with fresh closures ───
  const pointerMoveHandlerRef = useRef<(e: PointerEvent) => void>(() => {});
  const pointerUpHandlerRef = useRef<(e: PointerEvent) => void>(() => {});

  const stablePointerMove = useCallback((e: PointerEvent) => {
    pointerMoveHandlerRef.current(e);
  }, []);
  const stablePointerUp = useCallback((e: PointerEvent) => {
    pointerUpHandlerRef.current(e);
  }, []);

  useEffect(() => {
    pointerMoveHandlerRef.current = (e: PointerEvent) => {
      const drag = pointerDragRef.current;
      if (!drag) return;

      // Start drag after 5px threshold
      if (!drag.started) {
        const dx = e.clientX - drag.startX;
        const dy = e.clientY - drag.startY;
        if (Math.abs(dx) + Math.abs(dy) < 5) return;
        drag.started = true;
        setPointerDragIds(drag.ids);

        draggedCardIdRef.current = drag.ids[0];
      }

      setGhostPos({ x: e.clientX, y: e.clientY });

      // 1. Determine if we are inside the panel using coordinates, NOT elementFromPoint
      // (Because if it's pointer-events-none, elementFromPoint ignores it)
      let isInsidePanel = true;
      if (modalPanelRef.current) {
        const rect = modalPanelRef.current.getBoundingClientRect();
        // Add a small 10px buffer to prevent edge flickering
        isInsidePanel =
          e.clientX >= rect.left - 10 &&
          e.clientX <= rect.right + 10 &&
          e.clientY >= rect.top - 10 &&
          e.clientY <= rect.bottom + 10;
      }

      if (drag.started) {
        if (!isInsidePanel && !isDraggingOutsideRef.current) {
          isDraggingOutsideRef.current = true;
          setIsDraggingOutside(true);
          if (modalWrapperRef.current) {
            modalWrapperRef.current.style.opacity = '0';
            modalWrapperRef.current.style.pointerEvents = 'none';
          }
        } else if (isInsidePanel && isDraggingOutsideRef.current) {
          isDraggingOutsideRef.current = false;
          setIsDraggingOutside(false);
          if (modalWrapperRef.current) {
            modalWrapperRef.current.style.opacity = '1';
            modalWrapperRef.current.style.pointerEvents = 'auto';
          }
        }
      }

      // 2. Hit-test using elementFromPoint AFTER instantaneous DOM updates
      const elem = document.elementFromPoint(e.clientX, e.clientY);
      if (!elem) return;

      if (isDraggingOutsideRef.current) {
        // Hit-test against main page categories/folders because modal is now invisible
        const catElem = elem.closest('[data-category-title]');
        const cat = catElem?.getAttribute('data-category-title');
        if (cat) {
          setPointerDropTarget(`__main_category__${cat}`);
        } else {
          setPointerDropTarget('__backdrop__');
        }
        setDropTargetFolderId(null);
        clearSpringTimer();
        return;
      }

      // Check if over back arrow
      const backArrow = elem.closest('[data-folder-nav="back"]');
      if (backArrow) {
        setPointerDropTarget('__back__');
        setDropTargetFolderId(null);
        if (!springTimerRef.current) {
          backArrow.classList.add('bg-white/30', 'scale-110');
          springTimerRef.current = setTimeout(() => {
            springTimerRef.current = null;
            setCurrentFolderId((prevId) => {
              const curFolder = allResources.find((r) => r.id === prevId) as
                FolderResource | undefined;
              if (curFolder?.parentId) return curFolder.parentId;
              return prevId;
            });
          }, 800);
        }
        return;
      } else {
        const backBtn = modalPanelRef.current?.querySelector(
          '[data-folder-nav="back"]',
        );
        backBtn?.classList.remove('bg-white/30', 'scale-110');
      }

      // Check if over a breadcrumb
      const breadcrumbEl = elem.closest('[data-breadcrumb-id]');
      if (breadcrumbEl) {
        const bcId = breadcrumbEl.getAttribute('data-breadcrumb-id');
        setPointerDropTarget(`__breadcrumb__${bcId}`);
        setDropTargetFolderId(null);
        if (!springTimerRef.current && bcId) {
          breadcrumbEl.classList.add('bg-white/30', 'rounded', 'px-1');
          springTimerRef.current = setTimeout(() => {
            springTimerRef.current = null;
            setCurrentFolderId(bcId);
          }, 800);
        }
        return;
      } else {
        modalPanelRef.current
          ?.querySelectorAll('[data-breadcrumb-id]')
          .forEach((el) => {
            el.classList.remove('bg-white/30', 'rounded', 'px-1');
          });
      }

      // Check if over a folder item
      const folderItemEl = elem.closest('[data-folder-item-id]');
      const targetId =
        folderItemEl?.getAttribute('data-folder-item-id') || null;
      const targetType =
        folderItemEl?.getAttribute('data-folder-item-type') || null;

      if (targetId && targetType === 'folder' && !drag.ids.includes(targetId)) {
        const rect = folderItemEl!.getBoundingClientRect();
        const relativeX = (e.clientX - rect.left) / rect.width;
        if (relativeX >= 0.25 && relativeX <= 0.75) {
          setDropTargetFolderId(targetId);
          setPointerDropTarget(targetId);
          if (!springTimerRef.current) {
            springTimerRef.current = setTimeout(() => {
              springTimerRef.current = null;
              setCurrentFolderId(targetId);
              setDropTargetFolderId(null);
            }, 800);
          }
          return;
        }
      }

      // Over a regular item or folder edge — reorder
      setDropTargetFolderId(null);
      setPointerDropTarget(null);
      clearSpringTimer();

      if (targetId && !drag.ids.includes(targetId)) {
        const sourceId = drag.ids[0];
        const rect = folderItemEl!.getBoundingClientRect();
        const midX = rect.left + rect.width / 2;

        setLocalOrderedChildren((currentList) => {
          const targetIdx = currentList.findIndex((r) => r.id === targetId);
          if (targetIdx === -1) return currentList;

          const sourceIdx = currentList.findIndex((r) => r.id === sourceId);

          // Midpoint check to prevent flickering
          if (sourceIdx !== -1) {
            if (sourceIdx === targetIdx) return currentList;
            if (sourceIdx < targetIdx && e.clientX < midX) return currentList;
            if (sourceIdx > targetIdx && e.clientX > midX) return currentList;
          }

          // Get all items being dragged (from current list or allResources if they came from outside)
          const itemsToMove = drag.ids
            .map(
              (id) =>
                currentList.find((r) => r.id === id) ||
                allResources.find((r) => r.id === id),
            )
            .filter(Boolean) as Resource[];

          if (itemsToMove.length === 0) return currentList;

          // Remove them from the list
          const filtered = currentList.filter((r) => !drag.ids.includes(r.id));

          // Find where the target item ended up
          let newTargetIdx = filtered.findIndex((r) => r.id === targetId);
          if (newTargetIdx === -1) newTargetIdx = filtered.length;

          // Determine if we should insert after the target
          let insertAfter = false;
          if (sourceIdx !== -1) {
            insertAfter = sourceIdx < targetIdx;
          } else {
            // Came from outside. Determine based on mouse position
            insertAfter = e.clientX > midX;
          }

          if (insertAfter) {
            newTargetIdx++;
          }

          filtered.splice(newTargetIdx, 0, ...itemsToMove);
          localOrderedRef.current = filtered;
          return filtered;
        });
      }
    };

    pointerUpHandlerRef.current = (e: PointerEvent) => {
      const drag = pointerDragRef.current;
      if (!drag || !drag.started) {
        pointerDragRef.current = null;
        return;
      }

      // 1. Resolve drop target using coordinates
      let isInsidePanel = true;
      if (modalPanelRef.current) {
        const rect = modalPanelRef.current.getBoundingClientRect();
        isInsidePanel =
          e.clientX >= rect.left - 10 &&
          e.clientX <= rect.right + 10 &&
          e.clientY >= rect.top - 10 &&
          e.clientY <= rect.bottom + 10;
      }

      const elem = document.elementFromPoint(e.clientX, e.clientY);

      // If they dropped outside the panel, it's a drag-out, regardless of pointerMove state
      if (!isInsidePanel || isDraggingOutsideRef.current) {
        const catElem = elem?.closest('[data-category-title]');
        const cat = catElem?.getAttribute('data-category-title');

        if (cat) {
          onDropOnCategory?.(drag.ids, cat);
        } else {
          onDropOnCategory?.(drag.ids, null);
        }
        onClose();
      } else {
        const folderItemEl = elem?.closest('[data-folder-item-id]');
        const targetId =
          folderItemEl?.getAttribute('data-folder-item-id') || null;
        const targetType =
          folderItemEl?.getAttribute('data-folder-item-type') || null;

        let movedToSubfolder = false;
        if (
          targetId &&
          targetType === 'folder' &&
          !drag.ids.includes(targetId)
        ) {
          const rect = folderItemEl!.getBoundingClientRect();
          const relativeX = (e.clientX - rect.left) / rect.width;
          if (relativeX >= 0.25 && relativeX <= 0.75) {
            onMoveResourceToFolder(drag.ids, targetId);
            movedToSubfolder = true;
          }
        }

        if (!movedToSubfolder) {
          let finalOrdered = [...localOrderedRef.current];

          // Ensure all dragged items are present in finalOrdered (e.g. dropped in empty space of new folder)
          const missingIds = drag.ids.filter(
            (id) => !finalOrdered.find((r) => r.id === id),
          );
          if (missingIds.length > 0) {
            const missingItems = missingIds
              .map((id) => allResources.find((r) => r.id === id))
              .filter(Boolean) as Resource[];
            finalOrdered.push(...missingItems);
          }

          // Update their parentId to the current folder with CYCLE PREVENTION
          finalOrdered = finalOrdered.map((r) => {
            if (drag.ids.includes(r.id)) {
              // Prevent a folder from being moved into itself or its descendants
              if (r.type === 'folder' && currentFolder?.id) {
                let curr: string | undefined = currentFolder.id;
                let hasCycle = false;
                while (curr) {
                  if (curr === r.id) {
                    hasCycle = true;
                    break;
                  }
                  const parent = allResources.find((p) => p.id === curr);
                  curr = parent?.parentId;
                }
                if (hasCycle) {
                  return r; // Skip updating parentId
                }
              }
              return { ...r, parentId: currentFolder?.id };
            }
            return r;
          });

          onReorderInFolder(finalOrdered);
        }
      }

      document.removeEventListener('pointermove', stablePointerMove);
      document.removeEventListener('pointerup', stablePointerUp);
      if (modalWrapperRef.current) {
        modalWrapperRef.current.style.opacity = '';
        modalWrapperRef.current.style.pointerEvents = '';
      }
      endPointerDrag();
    };
  }); // Close the useEffect around handler refs

  const startPointerDrag = (e: React.PointerEvent, itemId: string) => {
    if (!isEditingFolder) return;
    e.preventDefault();
    e.stopPropagation();

    const ids = getDraggedIds(itemId);
    pointerDragRef.current = {
      ids,
      startX: e.clientX,
      startY: e.clientY,
      started: false,
    };

    document.addEventListener('pointermove', stablePointerMove);
    document.addEventListener('pointerup', stablePointerUp);
  };

  if (!folder_) return null;

  return (
    <>
      <div
        ref={modalWrapperRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="folder-directory-title"
        className={`fixed inset-0 flex items-center justify-center p-3 sm:p-6 transition-opacity duration-200 ${
          isDraggingOutside ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        style={{ zIndex: 40 }}
      >
        <button
          type="button"
          tabIndex={-1}
          aria-label="Close dialog"
          className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in cursor-default border-none"
          data-folder-backdrop="true"
          onClick={onClose}
        />

        <div
          ref={modalPanelRef}
          className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden z-10 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="bg-[#80131d] text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-3 overflow-hidden">
              {/* Back arrow — spring-loaded navigation on drag hover (no drop) */}
              {breadcrumbs.length > 1 && (
                <button
                  type="button"
                  data-folder-nav="back"
                  onClick={() => {
                    const parentIdx =
                      breadcrumbs.findIndex((b) => b.id === currentFolder.id) -
                      1;
                    if (parentIdx >= 0)
                      setCurrentFolderId(breadcrumbs[parentIdx].id);
                  }}
                  className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg shrink-0 cursor-pointer transition-all"
                  aria-label="Go back to parent folder"
                >
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
              )}
              <div className="p-2 bg-white/10 rounded-lg shrink-0">
                <svg
                  className="w-6 h-6 text-amber-300"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                </svg>
              </div>
              <div className="min-w-0">
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
                      if (trimmed && trimmed !== currentFolder.name) {
                        onRenameResource?.(currentFolder.id, trimmed);
                      }
                      setEditingNameId(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        committedRef.current = true;
                        const trimmed = editNameValue.trim();
                        if (trimmed && trimmed !== currentFolder.name) {
                          onRenameResource?.(currentFolder.id, trimmed);
                        }
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
                    className="text-lg sm:text-xl font-bold truncate drop-shadow-xs cursor-pointer hover:underline decoration-white/50 underline-offset-4"
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
                <div className="flex items-center space-x-1.5 text-xs text-white/80 overflow-x-auto whitespace-nowrap mt-0.5">
                  <span className="font-medium text-white/60">
                    {currentCategory}
                  </span>
                  <span>/</span>
                  {breadcrumbs.map((b, idx) => (
                    <React.Fragment key={b.id}>
                      {idx > 0 && <span>/</span>}
                      <button
                        type="button"
                        data-breadcrumb-id={b.id}
                        onClick={() => setCurrentFolderId(b.id)}
                        className={`hover:underline cursor-pointer transition-all ${
                          b.id === currentFolder.id
                            ? 'font-bold text-white'
                            : 'text-white/80'
                        }`}
                      >
                        {b.name}
                      </button>
                    </React.Fragment>
                  ))}
                </div>
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

          {/* Action Bar */}
          <div className="border-b border-neutral-200 bg-neutral-50 px-4 py-3 flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsCreatingFolder(true)}
              className="px-3 py-1.5 rounded-md text-xs font-semibold bg-[#374151] hover:bg-[#1f2937] text-white transition-colors flex items-center space-x-1.5 cursor-pointer shadow-xs shrink-0"
            >
              <svg
                className="w-3.5 h-3.5 text-amber-300"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
              </svg>
              <span>Subfolder</span>
            </button>

            <button
              type="button"
              onClick={() => onAddResourceToFolder(currentFolder.id)}
              className="px-3 py-1.5 rounded-md text-xs font-semibold bg-[#374151] hover:bg-[#1f2937] text-white transition-colors flex items-center space-x-1.5 cursor-pointer shadow-xs shrink-0"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>Resource</span>
            </button>

            <div className="flex-1">
              <SearchPill
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search by name, category..."
              />
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              {isEditingFolder && selectedIds.size > 0 && onDeleteResources && (
                <button
                  type="button"
                  onClick={() => {
                    const count = selectedIds.size;
                    if (
                      window.confirm(
                        `Are you sure you want to delete ${count} selected item(s)?`,
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
                className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer shadow-xs ${
                  isEditingFolder
                    ? 'bg-[#80131d] hover:bg-[#600f16] text-white'
                    : 'bg-[#374151] hover:bg-[#1f2937] text-white'
                }`}
              >
                {isEditingFolder ? 'Done' : 'Edit'}
              </button>
            </div>
          </div>

          {/* Create subfolder inline prompt */}
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

          {/* Directory Contents Explorer */}
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
              <div className="flex items-end space-x-4 overflow-x-auto scroll-smooth pt-2 pb-2 px-1">
                {localOrderedChildren.map((item) => {
                  const isSubfolder = item.type === 'folder';
                  const isDropTarget = dropTargetFolderId === item.id;
                  const isDraggingThis = pointerDragIds.includes(item.id);

                  return (
                    <div
                      key={item.id}
                      data-folder-item-id={item.id}
                      data-folder-item-type={item.type}
                      className={`shrink-0 transition-transform ${isDraggingThis ? 'opacity-40 scale-95' : ''}`}
                    >
                      <ResourceCard
                        resource={item}
                        isEditing={isEditingFolder}
                        isSelected={selectedIds.has(item.id)}
                        canReorder={isEditingFolder}
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
                          setSelectedIds((prev) => {
                            const next = new Set(prev);
                            if (next.has(id)) next.delete(id);
                            else next.add(id);
                            return next;
                          });
                        }}
                        onRoundButtonPointerDown={() => {}}
                        onRoundButtonClick={(id) => {
                          setSelectedIds((prev) => {
                            const next = new Set(prev);
                            if (next.has(id)) next.delete(id);
                            else next.add(id);
                            return next;
                          });
                        }}
                        onCardPointerDown={(e) => {
                          if (isEditingFolder) {
                            startPointerDrag(e, item.id);
                          }
                        }}
                        onClick={(resource) => {
                          if (justDraggedRef.current) return;
                          if (isEditingFolder) {
                            setSelectedIds((prev) => {
                              const next = new Set(prev);
                              if (next.has(resource.id))
                                next.delete(resource.id);
                              else next.add(resource.id);
                              return next;
                            });
                          } else if (resource.type === 'folder') {
                            setCurrentFolderId(resource.id);
                          } else {
                            onSelectResourceDetail(resource);
                          }
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

      {/* Floating drag ghost badge */}
      {ghostPos && pointerDragIds.length > 0 && (
        <div
          className="fixed pointer-events-none flex flex-col items-start"
          style={{
            left: ghostPos.x + 12,
            top: ghostPos.y - 12,
            zIndex: 9999,
          }}
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
          {isDraggingOutside &&
            pointerDropTarget?.startsWith('__main_category__') && (
              <div className="mt-2 text-xs font-bold text-white bg-[#80131d] px-2.5 py-1 rounded-full drop-shadow-md">
                + Add to {pointerDropTarget.replace('__main_category__', '')}
              </div>
            )}
        </div>
      )}
    </>
  );
}
export default FolderDirectoryModal;
