// Made with AI agents (Antigravity)
'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Resource } from '@/types/resource';
import { ResourceCard } from './ResourceCard';
import { SearchPill } from './SearchPill';
import {
  createSweepState,
  runSweepStep,
  extractDragPayload,
  SweepGestureState,
} from './sweep-selection';
import { getFolderChildren } from '@/lib/resources-data';

export const activeDragStore: {
  current: {
    resourceId: string;
    sourceCategory: string;
  } | null;
} = {
  current: null,
};

interface CategorySectionProps {
  categoryTitle: string;
  resources: Resource[];
  allResources?: Resource[];
  isEditing: boolean;
  selectedIds: Set<string>;
  activeDragSourceCategory?: string | null;
  activeDragResourceId?: string | null;
  activeMultiDragResourceIds?: string[];
  activeMultiDragHoveredCategory?: string | null;
  activeMultiDragCount?: number;
  isOverRemovalArea?: boolean;
  onToggleEdit: () => void;
  onOpenAddModal: (preselectedCategory: string) => void;
  onOpenCreateFolderModal?: (category: string) => void;
  onToggleSelect: (id: string) => void;
  onSelectMultiple: (ids: string[], select: boolean) => void;
  onUpdateSelectedIds?: (newIds: Set<string>) => void;
  onDeleteSelected: () => void;
  onSelectResourceDetail: (resource: Resource) => void;
  onReorderResources: (category: string, newOrderedList: Resource[]) => void;
  onDropIntoFolder?: (
    draggedResourceId: string,
    targetFolderId: string,
  ) => void;
  onStartDragCard?: (
    resourceId: string,
    sourceCategory: string,
    pos?: { x: number; y: number },
  ) => void;
  onEndDragCard?: () => void;
  onStartMultiDrag?: (
    resourceIds: string[],
    sourceCategory: string,
    pos: { x: number; y: number },
  ) => void;
  onMoveMultiDrag?: (pos: { x: number; y: number }) => void;
  onEndMultiDrag?: () => void;
  onDropOnCategory?: (
    resourceIds: string[] | string,
    targetCategory: string,
  ) => void;
  onRemoveFromCategory?: (
    resourceIds: string[] | string,
    sourceCategory: string,
  ) => void;
  onDragOverSection?: () => void;
  onRenameResource?: (id: string, newName: string) => void;
  multiDragHoveredFolderId?: string | null;
}

export function CategorySection({
  categoryTitle,
  resources,
  allResources,
  isEditing,
  selectedIds,
  activeDragSourceCategory,
  activeDragResourceId,
  activeMultiDragResourceIds,
  activeMultiDragHoveredCategory,
  activeMultiDragCount,
  isOverRemovalArea,
  onToggleEdit,
  onOpenAddModal,
  onOpenCreateFolderModal,
  onToggleSelect,
  onSelectMultiple,
  onUpdateSelectedIds,
  onDeleteSelected,
  onSelectResourceDetail,
  onReorderResources,
  onDropIntoFolder,
  onStartDragCard,
  onEndDragCard,
  onStartMultiDrag,
  onMoveMultiDrag,
  onEndMultiDrag,
  onDropOnCategory,
  onRemoveFromCategory,
  onDragOverSection,
  onRenameResource,
  multiDragHoveredFolderId,
}: CategorySectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [isDragOverSection, setIsDragOverSection] = useState(false);
  const dragDroppedSuccessfullyRef = useRef(false);
  const [hoverFolderDropTargetId, setHoverFolderDropTargetId] = useState<
    string | null
  >(null);
  const hoverFolderDropTargetIdRef = useRef<string | null>(null);

  const [localOrderedResources, setLocalOrderedResources] =
    useState<Resource[]>(resources);
  const localOrderedResourcesRef = useRef<Resource[]>(resources);
  const draggedCardIdRef = useRef<string | null>(null);
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);

  const isSweepSelecting = useRef(false);
  const justFinishedSweepRef = useRef(false);

  useEffect(() => {
    if (!draggedCardIdRef.current) {
      setLocalOrderedResources(resources);
      localOrderedResourcesRef.current = resources;
    }
  }, [resources]);

  const filteredResources = localOrderedResources.filter((res) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const matchesName = res.name.toLowerCase().includes(query);
    const matchesCategory = res.categories.some((c) =>
      c.toLowerCase().includes(query),
    );
    return matchesName || matchesCategory;
  });

  const selectedCountInCategory = filteredResources.filter((r) =>
    selectedIds.has(r.id),
  ).length;

  const canReorder = isEditing && selectedIds.size === 0;

  const handleSweepPointerDown = (
    startX: number,
    startY: number,
    cardId: string,
  ) => {
    let sweepStarted = false;
    let sweepState: SweepGestureState | null = null;

    const onMoveCheck = (moveEvent: PointerEvent) => {
      const dist = Math.hypot(
        moveEvent.clientX - startX,
        moveEvent.clientY - startY,
      );
      if (dist > 6) {
        if (!sweepStarted) {
          const startIndex = filteredResources.findIndex(
            (r) => r.id === cardId,
          );
          if (startIndex === -1) return;
          sweepStarted = true;
          isSweepSelecting.current = true;
          sweepState = createSweepState(
            startIndex,
            cardId,
            startX,
            moveEvent.clientX,
            selectedIds,
            filteredResources,
            scrollContainerRef.current,
          );
        }

        if (sweepState) {
          runSweepStep(
            moveEvent,
            sweepState,
            filteredResources,
            selectedIds,
            onUpdateSelectedIds,
            onSelectMultiple,
          );
        }
      }
    };

    const onCleanUp = () => {
      window.removeEventListener('pointermove', onMoveCheck);
      window.removeEventListener('pointerup', onCleanUp);
      window.removeEventListener('pointercancel', onCleanUp);

      if (sweepStarted) {
        justFinishedSweepRef.current = true;
        setTimeout(() => {
          justFinishedSweepRef.current = false;
        }, 150);
        isSweepSelecting.current = false;
      }
    };

    window.addEventListener('pointermove', onMoveCheck);
    window.addEventListener('pointerup', onCleanUp);
    window.addEventListener('pointercancel', onCleanUp);
  };

  const handleRoundButtonPointerDown = (
    e: React.PointerEvent,
    cardId: string,
  ) => {
    if (!isEditing) return;
    handleSweepPointerDown(e.clientX, e.clientY, cardId);
  };

  const handleRoundButtonClick = (cardId: string) => {
    if (justFinishedSweepRef.current) return;
    onToggleSelect(cardId);
  };

  const handleCardPointerDown = (e: React.PointerEvent, cardId: string) => {
    if (!isEditing || selectedIds.size === 0) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const isCardSelected = selectedIds.has(cardId);

    let gesture: 'undecided' | 'sweep' | 'vertical-drag' = 'undecided';
    let sweepStarted = false;
    let sweepState: SweepGestureState | null = null;
    let grabbedResourceIds: string[] = [];

    const onMoveCheck = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      const dist = Math.hypot(dx, dy);

      if (dist > 6) {
        if (gesture === 'undecided') {
          if (Math.abs(dx) > Math.abs(dy)) {
            const startIndex = filteredResources.findIndex(
              (r) => r.id === cardId,
            );
            if (startIndex === -1) return;
            gesture = 'sweep';
            isSweepSelecting.current = true;
            sweepStarted = true;
            sweepState = createSweepState(
              startIndex,
              cardId,
              startX,
              moveEvent.clientX,
              selectedIds,
              filteredResources,
              scrollContainerRef.current,
            );
          } else {
            gesture = 'vertical-drag';
            grabbedResourceIds = isCardSelected
              ? filteredResources
                  .filter((r) => selectedIds.has(r.id))
                  .map((r) => r.id)
              : [cardId];
            if (grabbedResourceIds.length === 0) grabbedResourceIds = [cardId];
            onStartMultiDrag?.(grabbedResourceIds, categoryTitle, {
              x: moveEvent.clientX,
              y: moveEvent.clientY,
            });
          }
        }
      }

      if (gesture === 'sweep' && sweepStarted && sweepState) {
        runSweepStep(
          moveEvent,
          sweepState,
          filteredResources,
          selectedIds,
          onUpdateSelectedIds,
          onSelectMultiple,
        );
      }

      if (gesture === 'vertical-drag') {
        onMoveMultiDrag?.({ x: moveEvent.clientX, y: moveEvent.clientY });
      }
    };

    const onCleanUp = () => {
      window.removeEventListener('pointermove', onMoveCheck);
      window.removeEventListener('pointerup', onCleanUp);
      window.removeEventListener('pointercancel', onCleanUp);

      if (gesture === 'sweep') {
        justFinishedSweepRef.current = true;
        setTimeout(() => {
          justFinishedSweepRef.current = false;
        }, 150);
        isSweepSelecting.current = false;
      } else if (gesture === 'vertical-drag') {
        justFinishedSweepRef.current = true;
        setTimeout(() => {
          justFinishedSweepRef.current = false;
        }, 150);
        onEndMultiDrag?.();
      }
    };

    window.addEventListener('pointermove', onMoveCheck);
    window.addEventListener('pointerup', onCleanUp);
    window.addEventListener('pointercancel', onCleanUp);
  };

  const handleToggleSelectSafe = (id: string) => {
    if (justFinishedSweepRef.current) return;
    onToggleSelect(id);
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    if (!isEditing || selectedIds.size > 0) {
      e.preventDefault();
      return;
    }
    draggedCardIdRef.current = id;
    setDraggedCardId(id);
    dragDroppedSuccessfullyRef.current = false;
    activeDragStore.current = { resourceId: id, sourceCategory: categoryTitle };

    e.dataTransfer.effectAllowed = 'copyMove';
    const payload = JSON.stringify({
      resourceId: id,
      sourceCategory: categoryTitle,
    });
    e.dataTransfer.setData('application/json', payload);
    e.dataTransfer.setData('text/plain', id);

    onStartDragCard?.(id, categoryTitle);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.stopPropagation();
    onDragOverSection?.();

    const sourceCat =
      activeDragStore.current?.sourceCategory || activeDragSourceCategory;

    if (sourceCat && sourceCat !== categoryTitle) {
      e.dataTransfer.dropEffect = 'copy';
      setIsDragOverSection(true);
      return;
    }

    e.dataTransfer.dropEffect = 'move';
    const sourceId = draggedCardIdRef.current;
    if (!sourceId || sourceId === targetId) return;

    const targetResource = localOrderedResources.find((r) => r.id === targetId);

    // If hovering over a folder, check if in the central drop-into-folder zone
    if (targetResource?.type === 'folder') {
      const rect = e.currentTarget.getBoundingClientRect();
      const relativeX = (e.clientX - rect.left) / rect.width;
      if (relativeX >= 0.25 && relativeX <= 0.75) {
        setHoverFolderDropTargetId(targetId);
        hoverFolderDropTargetIdRef.current = targetId;
        return;
      }
    }

    if (hoverFolderDropTargetIdRef.current) {
      setHoverFolderDropTargetId(null);
      hoverFolderDropTargetIdRef.current = null;
    }

    if (canReorder) {
      const rect = e.currentTarget.getBoundingClientRect();
      const midX = rect.left + rect.width / 2;
      const clientX = e.clientX;

      setLocalOrderedResources((currentList) => {
        const sourceIdx = currentList.findIndex((r) => r.id === sourceId);
        const targetIdx = currentList.findIndex((r) => r.id === targetId);

        if (sourceIdx === -1 || targetIdx === -1 || sourceIdx === targetIdx) {
          return currentList;
        }

        if (sourceIdx < targetIdx && clientX < midX) {
          return currentList;
        }
        if (sourceIdx > targetIdx && clientX > midX) {
          return currentList;
        }

        const updated = [...currentList];
        const [movedItem] = updated.splice(sourceIdx, 1);
        updated.splice(targetIdx, 0, movedItem);
        localOrderedResourcesRef.current = updated;
        return updated;
      });
    }
  };

  const handleDrop = (e: React.DragEvent, targetId?: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOverSection(false);

    const { resourceId, sourceCat } = extractDragPayload(
      e,
      activeDragStore.current,
      activeDragSourceCategory,
    );

    if (resourceId && sourceCat && sourceCat !== categoryTitle) {
      onDropOnCategory?.(resourceId, categoryTitle);
      activeDragStore.current = null;
      setHoverFolderDropTargetId(null);
      hoverFolderDropTargetIdRef.current = null;
      return;
    }

    const targetResource = targetId
      ? localOrderedResources.find((r) => r.id === targetId)
      : null;
    const isTargetAFolder = targetResource?.type === 'folder';

    const folderDropTarget =
      hoverFolderDropTargetIdRef.current ||
      hoverFolderDropTargetId ||
      (isTargetAFolder ? targetId : null);

    // Check if dropping directly into a folder
    if (folderDropTarget && (draggedCardIdRef.current || resourceId)) {
      const itemToMove = draggedCardIdRef.current || resourceId;
      if (itemToMove && itemToMove !== folderDropTarget) {
        onDropIntoFolder?.(itemToMove, folderDropTarget);
        dragDroppedSuccessfullyRef.current = true;
        draggedCardIdRef.current = null;
        setDraggedCardId(null);
        setHoverFolderDropTargetId(null);
        hoverFolderDropTargetIdRef.current = null;
        activeDragStore.current = null;
        return;
      }
    }

    dragDroppedSuccessfullyRef.current = true;
    const sourceId = draggedCardIdRef.current;
    if (sourceId && canReorder) {
      onReorderResources(categoryTitle, localOrderedResourcesRef.current);
    }
    draggedCardIdRef.current = null;
    setDraggedCardId(null);
    setHoverFolderDropTargetId(null);
    hoverFolderDropTargetIdRef.current = null;
    activeDragStore.current = null;
  };

  const handleDragEnd = () => {
    const cardId = draggedCardIdRef.current;
    const wasDroppedInside = dragDroppedSuccessfullyRef.current;

    if (
      cardId &&
      !wasDroppedInside &&
      isOverRemovalArea &&
      activeDragSourceCategory !== 'General'
    ) {
      onRemoveFromCategory?.(cardId, categoryTitle);
    } else {
      if (!wasDroppedInside) {
        setLocalOrderedResources(resources);
        localOrderedResourcesRef.current = resources;
      }
    }

    draggedCardIdRef.current = null;
    setDraggedCardId(null);
    setHoverFolderDropTargetId(null);
    dragDroppedSuccessfullyRef.current = false;
    activeDragStore.current = null;
    onEndDragCard?.();
  };

  const handleSectionDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    onDragOverSection?.();
    const sourceCat =
      activeDragStore.current?.sourceCategory || activeDragSourceCategory;

    if (sourceCat && sourceCat !== categoryTitle) {
      e.dataTransfer.dropEffect = 'copy';
      setIsDragOverSection(true);
    } else if (draggedCardIdRef.current) {
      e.dataTransfer.dropEffect = 'move';
    }
  };

  const handleSectionDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOverSection(false);
    }
  };

  const handleSectionDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverSection(false);

    const { resourceId, sourceCat } = extractDragPayload(
      e,
      activeDragStore.current,
      activeDragSourceCategory,
    );

    if (resourceId && sourceCat && sourceCat !== categoryTitle) {
      e.stopPropagation();
      onDropOnCategory?.(resourceId, categoryTitle);
      activeDragStore.current = null;
      return;
    }

    dragDroppedSuccessfullyRef.current = true;
    if (draggedCardIdRef.current && canReorder) {
      onReorderResources(categoryTitle, localOrderedResourcesRef.current);
    }
    draggedCardIdRef.current = null;
    setDraggedCardId(null);
    activeDragStore.current = null;
  };

  return (
    <section
      data-category-title={categoryTitle}
      onDragOver={handleSectionDragOver}
      onDragLeave={handleSectionDragLeave}
      onDrop={handleSectionDrop}
      className={`bg-white rounded-lg border shadow-xs p-4 sm:p-5 mb-6 transition-all duration-200 ${
        (isDragOverSection &&
          activeDragSourceCategory &&
          activeDragSourceCategory !== categoryTitle) ||
        (activeMultiDragHoveredCategory === categoryTitle &&
          activeDragSourceCategory !== categoryTitle)
          ? 'border-2 border-dashed border-[#80131d] bg-[#80131d]/5 ring-4 ring-[#80131d]/10'
          : 'border-neutral-300'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
        <div className="flex items-center space-x-2.5">
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
            {categoryTitle}
          </h2>
          {((isDragOverSection &&
            activeDragSourceCategory &&
            activeDragSourceCategory !== categoryTitle) ||
            (activeMultiDragHoveredCategory === categoryTitle &&
              activeDragSourceCategory !== categoryTitle)) && (
            <span className="text-xs bg-[#80131d] text-white px-2.5 py-0.5 rounded-full font-bold shadow-xs animate-pulse">
              + Add{' '}
              {activeMultiDragCount && activeMultiDragCount > 1
                ? `${activeMultiDragCount} resources to `
                : 'to '}
              {categoryTitle}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {isEditing && (
            <button
              type="button"
              disabled={selectedCountInCategory === 0}
              onClick={onDeleteSelected}
              className={`px-3 py-1 text-xs font-semibold rounded-md shadow-xs transition-colors flex items-center space-x-1 ${
                selectedCountInCategory > 0
                  ? 'text-white bg-red-700 hover:bg-red-800 cursor-pointer'
                  : 'text-neutral-400 bg-neutral-100 border border-neutral-200 cursor-not-allowed opacity-60'
              }`}
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
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              <span>
                Delete{' '}
                {selectedCountInCategory > 0
                  ? `(${selectedCountInCategory})`
                  : ''}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={onToggleEdit}
            className={`px-4 py-1 rounded-md text-sm font-semibold transition-colors cursor-pointer ${
              isEditing
                ? 'bg-neutral-900 text-white ring-2 ring-neutral-400'
                : 'bg-[#374151] hover:bg-[#1f2937] text-white'
            }`}
          >
            {isEditing ? 'Done' : 'Edit'}
          </button>

          <button
            type="button"
            onClick={() => onOpenAddModal(categoryTitle)}
            className="px-3.5 py-1 rounded-md text-sm font-semibold bg-[#374151] hover:bg-[#1f2937] text-white transition-colors cursor-pointer"
          >
            Add Resource
          </button>

          <button
            type="button"
            onClick={() => onOpenCreateFolderModal?.(categoryTitle)}
            className="px-3.5 py-1 rounded-md text-sm font-semibold bg-[#374151] hover:bg-[#1f2937] text-white transition-colors cursor-pointer"
          >
            Create Folder
          </button>

          <SearchPill value={searchQuery} onChange={setSearchQuery} />
        </div>
      </div>

      <div
        onDragOver={handleSectionDragOver}
        onDrop={handleSectionDrop}
        className="bg-[#E8ECEF] rounded-md p-4 sm:p-5 relative"
      >
        {filteredResources.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-neutral-500 font-medium text-sm">
              {searchQuery
                ? 'No resources match your search.'
                : 'No resources available.'}
            </p>
          </div>
        ) : (
          <div className="relative">
            <div
              ref={scrollContainerRef}
              onDragOver={handleSectionDragOver}
              onDrop={handleSectionDrop}
              className="flex items-end space-x-5 overflow-x-auto scroll-smooth pt-4 pb-4 px-1"
            >
              {filteredResources.map((resource) => {
                const isMultiDragged = Boolean(
                  activeMultiDragResourceIds?.includes(resource.id) &&
                  activeDragSourceCategory === categoryTitle,
                );
                const isThisCardDragged =
                  draggedCardId === resource.id ||
                  (activeDragSourceCategory === categoryTitle &&
                    activeDragResourceId === resource.id) ||
                  isMultiDragged;
                const showRemovalSymbol = Boolean(
                  isOverRemovalArea &&
                  activeDragSourceCategory !== 'General' &&
                  isThisCardDragged,
                );

                return (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    isEditing={isEditing}
                    isSelected={selectedIds.has(resource.id)}
                    canReorder={canReorder}
                    canDrag={isEditing && selectedIds.size === 0}
                    isDraggingThisCard={isThisCardDragged}
                    showRemovalSymbol={showRemovalSymbol}
                    isFolderDropTarget={
                      hoverFolderDropTargetId === resource.id ||
                      multiDragHoveredFolderId === resource.id
                    }
                    itemCount={
                      resource.type === 'folder'
                        ? (resource.childrenIds?.length ??
                          getFolderChildren(
                            allResources ?? resources,
                            resource.id,
                          ).length)
                        : undefined
                    }
                    onToggleSelect={handleToggleSelectSafe}
                    onRoundButtonPointerDown={handleRoundButtonPointerDown}
                    onRoundButtonClick={handleRoundButtonClick}
                    onCardPointerDown={handleCardPointerDown}
                    onClick={onSelectResourceDetail}
                    onRename={onRenameResource}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                    onDrop={handleDrop}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
export default CategorySection;
