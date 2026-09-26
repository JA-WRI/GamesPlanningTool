'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Resource } from '@/types/resource';
import { ResourceCard } from './ResourceCard';

export let globalActiveDragInfo: {
  resourceId: string;
  sourceCategory: string;
} | null = null;

interface CategorySectionProps {
  categoryTitle: string;
  resources: Resource[];
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
  onToggleSelect: (id: string) => void;
  onSelectMultiple: (ids: string[], select: boolean) => void;
  onUpdateSelectedIds?: (newIds: Set<string>) => void;
  onDeleteSelected: () => void;
  onSelectResourceDetail: (resource: Resource) => void;
  onReorderResources: (category: string, newOrderedList: Resource[]) => void;
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
}

export function CategorySection({
  categoryTitle,
  resources,
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
  onToggleSelect,
  onSelectMultiple,
  onUpdateSelectedIds,
  onDeleteSelected,
  onSelectResourceDetail,
  onReorderResources,
  onStartDragCard,
  onEndDragCard,
  onStartMultiDrag,
  onMoveMultiDrag,
  onEndMultiDrag,
  onDropOnCategory,
  onRemoveFromCategory,
  onDragOverSection,
}: CategorySectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [isDragOverSection, setIsDragOverSection] = useState(false);
  const dragDroppedSuccessfullyRef = useRef(false);

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
    let initialSelectedSnapshot = new Set<string>();
    let startIndex = -1;
    let initialDir: 'right' | 'left' = 'right';
    let lastCurrentIndex = -1;
    let lastClientX = startX;
    let movingDirection: 'right' | 'left' = 'right';

    const onMoveCheck = (moveEvent: PointerEvent) => {
      const dist = Math.hypot(
        moveEvent.clientX - startX,
        moveEvent.clientY - startY,
      );
      if (dist > 6) {
        if (!sweepStarted) {
          sweepStarted = true;
          isSweepSelecting.current = true;
          initialSelectedSnapshot = new Set(selectedIds);
          startIndex = filteredResources.findIndex((r) => r.id === cardId);
          if (startIndex === -1) return;

          initialDir = moveEvent.clientX >= startX ? 'right' : 'left';
          lastCurrentIndex = startIndex;
          lastClientX = moveEvent.clientX;
          movingDirection = initialDir;
        }

        if (startIndex === -1) return;

        if (scrollContainerRef.current) {
          const containerRect =
            scrollContainerRef.current.getBoundingClientRect();
          if (moveEvent.clientX < containerRect.left + 40) {
            scrollContainerRef.current.scrollLeft -= 12;
          } else if (moveEvent.clientX > containerRect.right - 40) {
            scrollContainerRef.current.scrollLeft += 12;
          }
        }

        const deltaX = moveEvent.clientX - lastClientX;
        if (deltaX > 2) {
          movingDirection = 'right';
          lastClientX = moveEvent.clientX;
        } else if (deltaX < -2) {
          movingDirection = 'left';
          lastClientX = moveEvent.clientX;
        }

        const elem = document.elementFromPoint(
          moveEvent.clientX,
          moveEvent.clientY,
        );
        const cardElem = elem?.closest('[data-resource-id]');
        const hoveredCardId = cardElem?.getAttribute('data-resource-id');

        let currentIndex = lastCurrentIndex;
        if (hoveredCardId) {
          const idx = filteredResources.findIndex(
            (r) => r.id === hoveredCardId,
          );
          if (idx !== -1) {
            currentIndex = idx;
            lastCurrentIndex = idx;
          }
        } else if (scrollContainerRef.current) {
          const cards = Array.from(
            scrollContainerRef.current.querySelectorAll('[data-resource-id]'),
          );
          let closestIdx = -1;
          let closestDist = Infinity;
          cards.forEach((c) => {
            const rect = c.getBoundingClientRect();
            const cardMidX = rect.left + rect.width / 2;
            const d = Math.abs(moveEvent.clientX - cardMidX);
            if (d < closestDist) {
              closestDist = d;
              const cId = c.getAttribute('data-resource-id');
              closestIdx = filteredResources.findIndex((r) => r.id === cId);
            }
          });
          if (closestIdx !== -1) {
            currentIndex = closestIdx;
            lastCurrentIndex = closestIdx;
          }
        }

        if (currentIndex > startIndex) {
          initialDir = 'right';
        } else if (currentIndex < startIndex) {
          initialDir = 'left';
        }

        let isUnselectingCluster = false;
        if (initialSelectedSnapshot.has(cardId)) {
          if (currentIndex > startIndex) {
            isUnselectingCluster = filteredResources
              .slice(startIndex + 1)
              .some((r) => initialSelectedSnapshot.has(r.id));
          } else if (currentIndex < startIndex) {
            isUnselectingCluster = filteredResources
              .slice(0, startIndex)
              .some((r) => initialSelectedSnapshot.has(r.id));
          } else {
            isUnselectingCluster =
              movingDirection === 'right'
                ? filteredResources
                    .slice(startIndex + 1)
                    .some((r) => initialSelectedSnapshot.has(r.id))
                : filteredResources
                    .slice(0, startIndex)
                    .some((r) => initialSelectedSnapshot.has(r.id));
          }
        }

        let minIdx = startIndex;
        let maxIdx = startIndex;

        if (currentIndex > startIndex) {
          if (movingDirection === 'right') {
            minIdx = startIndex;
            maxIdx = currentIndex;
          } else {
            minIdx = startIndex;
            maxIdx = Math.max(startIndex, currentIndex - 1);
          }
        } else if (currentIndex < startIndex) {
          if (movingDirection === 'left') {
            minIdx = currentIndex;
            maxIdx = startIndex;
          } else {
            minIdx = Math.min(startIndex, currentIndex + 1);
            maxIdx = startIndex;
          }
        } else {
          const isAtRest =
            (movingDirection === 'right' &&
              moveEvent.clientX >= startX &&
              initialDir === 'left') ||
            (movingDirection === 'left' &&
              moveEvent.clientX <= startX &&
              initialDir === 'right');

          if (isAtRest) {
            minIdx = 1;
            maxIdx = 0;
          } else {
            minIdx = startIndex;
            maxIdx = startIndex;
          }
        }

        const nextSelection = new Set(initialSelectedSnapshot);
        for (let i = 0; i < filteredResources.length; i++) {
          const resId = filteredResources[i].id;
          if (i >= minIdx && i <= maxIdx) {
            if (isUnselectingCluster) {
              if (initialSelectedSnapshot.has(resId)) {
                nextSelection.delete(resId);
              } else {
                nextSelection.add(resId);
              }
            } else {
              nextSelection.add(resId);
            }
          } else {
            if (initialSelectedSnapshot.has(resId)) {
              nextSelection.add(resId);
            } else {
              nextSelection.delete(resId);
            }
          }
        }

        if (onUpdateSelectedIds) {
          onUpdateSelectedIds(nextSelection);
        } else {
          const toAdd: string[] = [];
          const toRemove: string[] = [];
          filteredResources.forEach((r) => {
            const shouldBeSelected = nextSelection.has(r.id);
            const isCurrentlySelected = selectedIds.has(r.id);
            if (shouldBeSelected && !isCurrentlySelected) toAdd.push(r.id);
            if (!shouldBeSelected && isCurrentlySelected) toRemove.push(r.id);
          });
          if (toAdd.length > 0) onSelectMultiple(toAdd, true);
          if (toRemove.length > 0) onSelectMultiple(toRemove, false);
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
    if (!isEditing) return;
    if (selectedIds.size === 0) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const isCardSelected = selectedIds.has(cardId);

    let gesture: 'undecided' | 'sweep' | 'vertical-drag' = 'undecided';

    let sweepStarted = false;
    let initialSelectedSnapshot = new Set<string>();
    let startIndex = -1;
    let initialDir: 'right' | 'left' = 'right';
    let lastCurrentIndex = -1;
    let lastClientX = startX;
    let movingDirection: 'right' | 'left' = 'right';

    let grabbedResourceIds: string[] = [];

    const onMoveCheck = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      const dist = Math.hypot(dx, dy);

      if (dist > 6) {
        if (gesture === 'undecided') {
          if (Math.abs(dx) > Math.abs(dy)) {
            gesture = 'sweep';
            isSweepSelecting.current = true;
            initialSelectedSnapshot = new Set(selectedIds);
            startIndex = filteredResources.findIndex((r) => r.id === cardId);
            if (startIndex === -1) return;

            initialDir = moveEvent.clientX >= startX ? 'right' : 'left';
            lastCurrentIndex = startIndex;
            lastClientX = moveEvent.clientX;
            movingDirection = initialDir;
            sweepStarted = true;
          } else {
            gesture = 'vertical-drag';
            if (isCardSelected) {
              grabbedResourceIds = filteredResources
                .filter((r) => selectedIds.has(r.id))
                .map((r) => r.id);
            } else {
              grabbedResourceIds = [cardId];
            }
            if (grabbedResourceIds.length === 0) {
              grabbedResourceIds = [cardId];
            }
            onStartMultiDrag?.(grabbedResourceIds, categoryTitle, {
              x: moveEvent.clientX,
              y: moveEvent.clientY,
            });
          }
        }
      }

      if (gesture === 'sweep' && sweepStarted) {
        if (scrollContainerRef.current) {
          const containerRect =
            scrollContainerRef.current.getBoundingClientRect();
          if (moveEvent.clientX < containerRect.left + 40) {
            scrollContainerRef.current.scrollLeft -= 12;
          } else if (moveEvent.clientX > containerRect.right - 40) {
            scrollContainerRef.current.scrollLeft += 12;
          }
        }

        const deltaX = moveEvent.clientX - lastClientX;
        if (deltaX > 2) {
          movingDirection = 'right';
          lastClientX = moveEvent.clientX;
        } else if (deltaX < -2) {
          movingDirection = 'left';
          lastClientX = moveEvent.clientX;
        }

        const elem = document.elementFromPoint(
          moveEvent.clientX,
          moveEvent.clientY,
        );
        const cardElem = elem?.closest('[data-resource-id]');
        const hoveredCardId = cardElem?.getAttribute('data-resource-id');

        let currentIndex = lastCurrentIndex;
        if (hoveredCardId) {
          const idx = filteredResources.findIndex(
            (r) => r.id === hoveredCardId,
          );
          if (idx !== -1) {
            currentIndex = idx;
            lastCurrentIndex = idx;
          }
        } else if (scrollContainerRef.current) {
          const cards = Array.from(
            scrollContainerRef.current.querySelectorAll('[data-resource-id]'),
          );
          let closestIdx = -1;
          let closestDist = Infinity;
          cards.forEach((c) => {
            const rect = c.getBoundingClientRect();
            const cardMidX = rect.left + rect.width / 2;
            const d = Math.abs(moveEvent.clientX - cardMidX);
            if (d < closestDist) {
              closestDist = d;
              const cId = c.getAttribute('data-resource-id');
              closestIdx = filteredResources.findIndex((r) => r.id === cId);
            }
          });
          if (closestIdx !== -1) {
            currentIndex = closestIdx;
            lastCurrentIndex = closestIdx;
          }
        }

        if (currentIndex > startIndex) {
          initialDir = 'right';
        } else if (currentIndex < startIndex) {
          initialDir = 'left';
        }

        let isUnselectingCluster = false;
        if (initialSelectedSnapshot.has(cardId)) {
          if (currentIndex > startIndex) {
            isUnselectingCluster = filteredResources
              .slice(startIndex + 1)
              .some((r) => initialSelectedSnapshot.has(r.id));
          } else if (currentIndex < startIndex) {
            isUnselectingCluster = filteredResources
              .slice(0, startIndex)
              .some((r) => initialSelectedSnapshot.has(r.id));
          } else {
            isUnselectingCluster =
              movingDirection === 'right'
                ? filteredResources
                    .slice(startIndex + 1)
                    .some((r) => initialSelectedSnapshot.has(r.id))
                : filteredResources
                    .slice(0, startIndex)
                    .some((r) => initialSelectedSnapshot.has(r.id));
          }
        }

        let minIdx = startIndex;
        let maxIdx = startIndex;

        if (currentIndex > startIndex) {
          if (movingDirection === 'right') {
            minIdx = startIndex;
            maxIdx = currentIndex;
          } else {
            minIdx = startIndex;
            maxIdx = Math.max(startIndex, currentIndex - 1);
          }
        } else if (currentIndex < startIndex) {
          if (movingDirection === 'left') {
            minIdx = currentIndex;
            maxIdx = startIndex;
          } else {
            minIdx = Math.min(startIndex, currentIndex + 1);
            maxIdx = startIndex;
          }
        } else {
          const isAtRest =
            (movingDirection === 'right' &&
              moveEvent.clientX >= startX &&
              initialDir === 'left') ||
            (movingDirection === 'left' &&
              moveEvent.clientX <= startX &&
              initialDir === 'right');

          if (isAtRest) {
            minIdx = 1;
            maxIdx = 0;
          } else {
            minIdx = startIndex;
            maxIdx = startIndex;
          }
        }

        const nextSelection = new Set(initialSelectedSnapshot);
        for (let i = 0; i < filteredResources.length; i++) {
          const resId = filteredResources[i].id;
          if (i >= minIdx && i <= maxIdx) {
            if (isUnselectingCluster) {
              if (initialSelectedSnapshot.has(resId)) {
                nextSelection.delete(resId);
              } else {
                nextSelection.add(resId);
              }
            } else {
              nextSelection.add(resId);
            }
          } else {
            if (initialSelectedSnapshot.has(resId)) {
              nextSelection.add(resId);
            } else {
              nextSelection.delete(resId);
            }
          }
        }

        if (onUpdateSelectedIds) {
          onUpdateSelectedIds(nextSelection);
        } else {
          const toAdd: string[] = [];
          const toRemove: string[] = [];
          filteredResources.forEach((r) => {
            const shouldBeSelected = nextSelection.has(r.id);
            const isCurrentlySelected = selectedIds.has(r.id);
            if (shouldBeSelected && !isCurrentlySelected) toAdd.push(r.id);
            if (!shouldBeSelected && isCurrentlySelected) toRemove.push(r.id);
          });
          if (toAdd.length > 0) onSelectMultiple(toAdd, true);
          if (toRemove.length > 0) onSelectMultiple(toRemove, false);
        }
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
    globalActiveDragInfo = { resourceId: id, sourceCategory: categoryTitle };

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
      globalActiveDragInfo?.sourceCategory || activeDragSourceCategory;

    if (sourceCat && sourceCat !== categoryTitle) {
      e.dataTransfer.dropEffect = 'copy';
      setIsDragOverSection(true);
      return;
    }

    e.dataTransfer.dropEffect = 'move';
    const sourceId = draggedCardIdRef.current;
    if (!sourceId || sourceId === targetId) return;

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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOverSection(false);

    let resourceId = globalActiveDragInfo?.resourceId || '';
    let sourceCat =
      globalActiveDragInfo?.sourceCategory || activeDragSourceCategory || '';

    if (!resourceId) {
      try {
        const raw = e.dataTransfer.getData('application/json');
        if (raw) {
          const parsed = JSON.parse(raw);
          resourceId = parsed.resourceId || '';
          sourceCat = parsed.sourceCategory || sourceCat;
        }
      } catch {
        // fallback
      }
      if (!resourceId) {
        resourceId = e.dataTransfer.getData('text/plain');
      }
    }

    if (resourceId && sourceCat && sourceCat !== categoryTitle) {
      onDropOnCategory?.(resourceId, categoryTitle);
      globalActiveDragInfo = null;
      return;
    }

    dragDroppedSuccessfullyRef.current = true;
    const sourceId = draggedCardIdRef.current;
    if (sourceId && canReorder) {
      onReorderResources(categoryTitle, localOrderedResourcesRef.current);
    }
    draggedCardIdRef.current = null;
    setDraggedCardId(null);
    globalActiveDragInfo = null;
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
    dragDroppedSuccessfullyRef.current = false;
    globalActiveDragInfo = null;
    onEndDragCard?.();
  };

  const handleSectionDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    onDragOverSection?.();
    const sourceCat =
      globalActiveDragInfo?.sourceCategory || activeDragSourceCategory;

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

    let resourceId = globalActiveDragInfo?.resourceId || '';
    let sourceCat =
      globalActiveDragInfo?.sourceCategory || activeDragSourceCategory || '';

    if (!resourceId) {
      try {
        const raw = e.dataTransfer.getData('application/json');
        if (raw) {
          const parsed = JSON.parse(raw);
          resourceId = parsed.resourceId || '';
          sourceCat = parsed.sourceCategory || sourceCat;
        }
      } catch {
        // fallback
      }
      if (!resourceId) {
        resourceId = e.dataTransfer.getData('text/plain');
      }
    }

    if (resourceId && sourceCat && sourceCat !== categoryTitle) {
      e.stopPropagation();
      onDropOnCategory?.(resourceId, categoryTitle);
      globalActiveDragInfo = null;
      return;
    }

    dragDroppedSuccessfullyRef.current = true;
    if (draggedCardIdRef.current && canReorder) {
      onReorderResources(categoryTitle, localOrderedResourcesRef.current);
    }
    draggedCardIdRef.current = null;
    setDraggedCardId(null);
    globalActiveDragInfo = null;
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
            className="px-4 py-1 rounded-md text-sm font-semibold bg-[#374151] hover:bg-[#1f2937] text-white transition-colors cursor-pointer"
          >
            Add
          </button>

          <div className="relative min-w-[220px] sm:min-w-[260px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, category..."
              className="w-full pl-4 pr-9 py-1 text-xs sm:text-sm bg-white border border-[#80131d] rounded-full focus:outline-hidden focus:ring-2 focus:ring-[#80131d]/20 placeholder:text-neutral-500 transition-all"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                <svg
                  className="w-3.5 h-3.5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            ) : (
              <svg
                className="w-4 h-4 text-[#80131d] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            )}
          </div>
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
              className="flex items-center space-x-5 overflow-x-auto scroll-smooth py-2 px-1"
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
                    onToggleSelect={handleToggleSelectSafe}
                    onRoundButtonPointerDown={handleRoundButtonPointerDown}
                    onRoundButtonClick={handleRoundButtonClick}
                    onCardPointerDown={handleCardPointerDown}
                    onClick={onSelectResourceDetail}
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
