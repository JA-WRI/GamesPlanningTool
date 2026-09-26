'use client';

import React, { useState, useRef, useEffect, useSyncExternalStore } from 'react';
import { Resource } from '@/types/resource';
import {
  INITIAL_RESOURCES,
  subscribeToResources,
  getCachedResources,
  saveResourcesToStorage,
} from '@/lib/resources-data';
import { CategorySection, globalActiveDragInfo } from './CategorySection';
import { AddResourceModal } from './AddResourceModal';
import { ResourceDetailModal } from './ResourceDetailModal';

export function ResourcesPageContent() {
  const resources = useSyncExternalStore(
    subscribeToResources,
    getCachedResources,
    () => INITIAL_RESOURCES,
  );

  const [globalSearch, setGlobalSearch] = useState('');

  const [isGlobalEditing, setIsGlobalEditing] = useState(false);
  const [categoryEditModes, setCategoryEditModes] = useState<
    Record<string, boolean>
  >({});

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [preselectedCategory, setPreselectedCategory] = useState<
    string | undefined
  >(undefined);
  const [detailResource, setDetailResource] = useState<Resource | null>(null);

  const updateResources = (newResources: Resource[]) => {
    saveResourcesToStorage(newResources);
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectMultiple = (ids: string[], select: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => {
        if (select) {
          next.add(id);
        } else {
          next.delete(id);
        }
      });
      return next;
    });
  };

  const handleDeleteAllSelected = () => {
    if (selectedIds.size === 0) return;
    const count = selectedIds.size;
    const confirmMsg = `Are you sure you want to delete ${count} selected resource${
      count > 1 ? 's' : ''
    }?`;
    if (typeof window !== 'undefined' && !window.confirm(confirmMsg)) {
      return;
    }

    const updated = resources.filter((r) => !selectedIds.has(r.id));
    updateResources(updated);
    setSelectedIds(new Set());
    showToast(`Deleted ${count} selected resource${count > 1 ? 's' : ''}`);
  };

  const handleDeleteSelectedInCategory = (categoryTitle: string) => {
    const categorySelected = resources.filter(
      (r) => r.categories.includes(categoryTitle) && selectedIds.has(r.id),
    );
    if (categorySelected.length === 0) return;

    const count = categorySelected.length;
    const confirmMsg = `Are you sure you want to delete ${count} selected resource${
      count > 1 ? 's' : ''
    } from ${categoryTitle}?`;
    if (typeof window !== 'undefined' && !window.confirm(confirmMsg)) {
      return;
    }

    const idsToDelete = new Set(categorySelected.map((r) => r.id));
    const updated = resources.filter((r) => !idsToDelete.has(r.id));
    updateResources(updated);

    setSelectedIds((prev) => {
      const next = new Set(prev);
      idsToDelete.forEach((id) => next.delete(id));
      return next;
    });

    showToast(
      `Deleted ${count} resource${count > 1 ? 's' : ''} from ${categoryTitle}`,
    );
  };

  const handleReorderResources = (
    category: string,
    newOrderedList: Resource[],
  ) => {
    const otherResources = resources.filter(
      (r) => !r.categories.includes(category),
    );
    const merged = [...otherResources, ...newOrderedList];
    updateResources(merged);
  };

  const handleAddResource = (newResource: Resource) => {
    const updated = [newResource, ...resources];
    updateResources(updated);
  };

  const [activeDragCategory, setActiveDragCategory] = useState<string | null>(null);
  const [activeDragResourceId, setActiveDragResourceId] = useState<string | null>(null);
  const [isOverRemovalArea, setIsOverRemovalArea] = useState(false);
  const dragHandledRef = useRef(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  interface ActiveMultiDrag {
    resourceIds: string[];
    sourceCategory: string;
    currentX: number;
    currentY: number;
    isOverRemoval: boolean;
    hoveredCategoryTitle: string | null;
  }
  const [activeMultiDrag, setActiveMultiDrag] = useState<ActiveMultiDrag | null>(null);
  const activeMultiDragRef = useRef<ActiveMultiDrag | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3500);
  };

  const handleAddCategoryToResources = (
    resourceIds: string[],
    targetCategory: string,
  ) => {
    dragHandledRef.current = true;
    if (resourceIds.length === 0) return;

    const targets = resources.filter((r) => resourceIds.includes(r.id));
    if (targets.length === 0) return;

    const resourcesToUpdate = targets.filter(
      (r) => !r.categories.includes(targetCategory),
    );

    if (resourcesToUpdate.length === 0) {
      if (targets.length === 1) {
        showToast(`"${targets[0].name}" is already in ${targetCategory}`);
      } else {
        showToast(`Selected resources are already in ${targetCategory}`);
      }
      return;
    }

    const updatedMap = new Map<string, Resource>();
    resourcesToUpdate.forEach((targetResource) => {
      const withoutGeneral = targetResource.categories.filter((c) => c !== 'General');
      const newCategories = [...withoutGeneral, targetCategory];
      updatedMap.set(targetResource.id, {
        ...targetResource,
        categories: newCategories.length > 0 ? newCategories : ['General'],
      });
    });

    const otherResources = resources.filter((r) => !updatedMap.has(r.id));
    const newUpdatedItems = Array.from(updatedMap.values());

    const firstTargetIndex = otherResources.findIndex((r) =>
      r.categories.includes(targetCategory),
    );

    let updated: Resource[];
    if (firstTargetIndex !== -1) {
      updated = [
        ...otherResources.slice(0, firstTargetIndex),
        ...newUpdatedItems,
        ...otherResources.slice(firstTargetIndex),
      ];
    } else {
      updated = [...newUpdatedItems, ...otherResources];
    }

    updateResources(updated);
    if (newUpdatedItems.length === 1) {
      showToast(`Added "${newUpdatedItems[0].name}" to the front of ${targetCategory}`);
    } else {
      showToast(`Added ${newUpdatedItems.length} resources to the front of ${targetCategory}`);
    }
  };

  const handleRemoveCategoryFromResources = (
    resourceIds: string[],
    sourceCategory: string,
  ) => {
    if (resourceIds.length === 0) return;

    if (sourceCategory === 'General') {
      if (resourceIds.length === 1) {
        const r = resources.find((res) => res.id === resourceIds[0]);
        showToast(`"${r?.name || 'Resource'}" remains in General (must have at least one category)`);
      } else {
        showToast(`Selected resources remain in General (must have at least one category)`);
      }
      return;
    }

    const targetIdsSet = new Set(resourceIds);
    const updatedMap = new Map<string, Resource>();
    const sentToGeneral: Resource[] = [];

    resources.forEach((r) => {
      if (targetIdsSet.has(r.id)) {
        const remaining = r.categories.filter((c) => c !== sourceCategory);
        const finalCategories = remaining.length > 0 ? remaining : ['General'];
        const updatedResource: Resource = {
          ...r,
          categories: finalCategories,
        };
        updatedMap.set(r.id, updatedResource);
        if (remaining.length === 0) {
          sentToGeneral.push(updatedResource);
        }
      }
    });

    const otherResources = resources.filter((r) => !updatedMap.has(r.id));
    const nonGeneralUpdated = Array.from(updatedMap.values()).filter(
      (r) => !sentToGeneral.some((sg) => sg.id === r.id),
    );

    let updated: Resource[];
    if (sentToGeneral.length > 0) {
      const firstGeneralIndex = otherResources.findIndex((r) =>
        r.categories.includes('General'),
      );
      if (firstGeneralIndex !== -1) {
        updated = [
          ...otherResources.slice(0, firstGeneralIndex),
          ...sentToGeneral,
          ...otherResources.slice(firstGeneralIndex),
          ...nonGeneralUpdated,
        ];
      } else {
        updated = [...sentToGeneral, ...otherResources, ...nonGeneralUpdated];
      }
    } else {
      updated = resources.map((r) => updatedMap.get(r.id) || r);
    }

    updateResources(updated);
    if (resourceIds.length === 1) {
      const r = resources.find((res) => res.id === resourceIds[0]);
      if (sentToGeneral.length > 0) {
        showToast(`Removed from ${sourceCategory} (moved to front of General)`);
      } else {
        showToast(`Removed "${r?.name || 'Resource'}" from ${sourceCategory}`);
      }
    } else {
      if (sentToGeneral.length > 0) {
        showToast(
          `Removed ${resourceIds.length} resources from ${sourceCategory} (${sentToGeneral.length} moved to General)`,
        );
      } else {
        showToast(`Removed ${resourceIds.length} resources from ${sourceCategory}`);
      }
    }
  };

  const handleRemoveCategoryFromResource = (
    resourceId: string,
    sourceCategory: string,
  ) => {
    handleRemoveCategoryFromResources([resourceId], sourceCategory);
  };

  const activeDragCategoryRef = useRef<string | null>(null);
  const activeDragResourceIdRef = useRef<string | null>(null);
  const isOverRemovalAreaRef = useRef(false);

  useEffect(() => {
    activeDragCategoryRef.current = activeDragCategory;
    activeDragResourceIdRef.current = activeDragResourceId;
  }, [activeDragCategory, activeDragResourceId]);

  const handleStartDragCard = (resourceId: string, sourceCategory: string) => {
    dragHandledRef.current = false;
    activeDragCategoryRef.current = sourceCategory;
    activeDragResourceIdRef.current = resourceId;
    isOverRemovalAreaRef.current = false;
    setActiveDragCategory(sourceCategory);
    setActiveDragResourceId(resourceId);
    setIsOverRemovalArea(false);
  };

  const handleStartMultiDrag = (
    resourceIds: string[],
    sourceCategory: string,
    pos: { x: number; y: number },
  ) => {
    dragHandledRef.current = false;
    activeDragCategoryRef.current = sourceCategory;
    activeDragResourceIdRef.current = resourceIds[0] || null;
    setActiveDragCategory(sourceCategory);
    setActiveDragResourceId(resourceIds[0] || null);

    const initialDrag: ActiveMultiDrag = {
      resourceIds,
      sourceCategory,
      currentX: pos.x,
      currentY: pos.y,
      isOverRemoval: false,
      hoveredCategoryTitle: null,
    };
    activeMultiDragRef.current = initialDrag;
    setActiveMultiDrag(initialDrag);
  };

  const handleMoveMultiDrag = (pos: { x: number; y: number }) => {
    const cur = activeMultiDragRef.current;
    if (!cur) return;

    const elem = document.elementFromPoint(pos.x, pos.y);
    const section = elem?.closest('section[data-category-title]');
    const hoveredTitle = section?.getAttribute('data-category-title') || null;

    let isOverRemoval = false;
    let hoveredCat: string | null = null;

    if (hoveredTitle) {
      if (hoveredTitle !== cur.sourceCategory) {
        hoveredCat = hoveredTitle;
      }
    } else {
      if (cur.sourceCategory !== 'General') {
        isOverRemoval = true;
      }
    }

    const updated: ActiveMultiDrag = {
      ...cur,
      currentX: pos.x,
      currentY: pos.y,
      isOverRemoval,
      hoveredCategoryTitle: hoveredCat,
    };
    activeMultiDragRef.current = updated;
    setActiveMultiDrag(updated);
    setIsOverRemovalArea(isOverRemoval);
  };

  const handleEndMultiDrag = () => {
    const cur = activeMultiDragRef.current;
    if (cur) {
      if (cur.hoveredCategoryTitle && cur.hoveredCategoryTitle !== cur.sourceCategory) {
        handleAddCategoryToResources(cur.resourceIds, cur.hoveredCategoryTitle);
      } else if (cur.isOverRemoval) {
        handleRemoveCategoryFromResources(cur.resourceIds, cur.sourceCategory);
      }
    }

    activeMultiDragRef.current = null;
    setActiveMultiDrag(null);
    activeDragCategoryRef.current = null;
    activeDragResourceIdRef.current = null;
    setIsOverRemovalArea(false);
    setActiveDragCategory(null);
    setActiveDragResourceId(null);
  };

  const handleEndDragCard = () => {
    activeDragCategoryRef.current = null;
    activeDragResourceIdRef.current = null;
    isOverRemovalAreaRef.current = false;
    setActiveDragCategory(null);
    setActiveDragResourceId(null);
    setIsOverRemovalArea(false);
  };

  const handleDropOnCategory = (
    resourceIdOrIds: string[] | string,
    targetCategory: string,
  ) => {
    dragHandledRef.current = true;
    const ids = Array.isArray(resourceIdOrIds) ? resourceIdOrIds : [resourceIdOrIds];
    handleAddCategoryToResources(ids, targetCategory);
    handleEndDragCard();
  };

  const handleRemoveFromCategory = (
    resourceIdOrIds: string[] | string,
    sourceCategory: string,
  ) => {
    if (!dragHandledRef.current) {
      const ids = Array.isArray(resourceIdOrIds) ? resourceIdOrIds : [resourceIdOrIds];
      handleRemoveCategoryFromResources(ids, sourceCategory);
    }
    handleEndDragCard();
  };

  const handleHoverSection = () => {
    isOverRemovalAreaRef.current = false;
    setIsOverRemovalArea(false);
  };

  const handleMainDragOver = (e: React.DragEvent) => {
    const curCat =
      activeDragCategoryRef.current ||
      activeDragCategory ||
      globalActiveDragInfo?.sourceCategory;
    if (curCat) {
      e.preventDefault();
      const targetElem = e.target as HTMLElement;
      const insideSection = Boolean(targetElem.closest('section'));
      const shouldBeRemoval = !insideSection && curCat !== 'General';
      isOverRemovalAreaRef.current = shouldBeRemoval;
      setIsOverRemovalArea((prev) =>
        prev !== shouldBeRemoval ? shouldBeRemoval : prev,
      );
    }
  };

  const handlePageDrop = (e: React.DragEvent) => {
    const targetElem = e.target as HTMLElement;
    const insideSection = Boolean(targetElem.closest('section'));
    if (!insideSection) {
      e.preventDefault();
      const resId =
        activeDragResourceIdRef.current ||
        activeDragResourceId ||
        globalActiveDragInfo?.resourceId;
      const cat =
        activeDragCategoryRef.current ||
        activeDragCategory ||
        globalActiveDragInfo?.sourceCategory;
      if (resId && cat) {
        handleRemoveCategoryFromResource(resId, cat);
      }
    }
    handleEndDragCard();
  };

  useEffect(() => {
    let scrollSpeed = 0;
    let animationFrameId: number | null = null;
    const EDGE_THRESHOLD = 120;
    const MAX_SPEED = 24;

    const scrollLoop = () => {
      if (scrollSpeed !== 0) {
        window.scrollBy(0, scrollSpeed);
        animationFrameId = requestAnimationFrame(scrollLoop);
      } else {
        animationFrameId = null;
      }
    };

    const handlePointerOrDrag = (clientY: number) => {
      const vh = window.innerHeight;
      if (clientY < EDGE_THRESHOLD) {
        const ratio = Math.max(
          0,
          Math.min(1, (EDGE_THRESHOLD - clientY) / EDGE_THRESHOLD),
        );
        scrollSpeed = -Math.max(4, Math.round(ratio * MAX_SPEED));
        if (!animationFrameId) {
          animationFrameId = requestAnimationFrame(scrollLoop);
        }
      } else if (clientY > vh - EDGE_THRESHOLD) {
        const ratio = Math.max(
          0,
          Math.min(1, (clientY - (vh - EDGE_THRESHOLD)) / EDGE_THRESHOLD),
        );
        scrollSpeed = Math.max(4, Math.round(ratio * MAX_SPEED));
        if (!animationFrameId) {
          animationFrameId = requestAnimationFrame(scrollLoop);
        }
      } else {
        scrollSpeed = 0;
      }
    };

    const onDragOver = (e: DragEvent) => {
      handlePointerOrDrag(e.clientY);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.buttons > 0) {
        handlePointerOrDrag(e.clientY);
      } else {
        scrollSpeed = 0;
      }
    };

    const onDragEndOrDrop = () => {
      scrollSpeed = 0;
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
      setIsOverRemovalArea(false);
    };

    window.addEventListener('dragover', onDragOver);
    window.addEventListener('dragend', onDragEndOrDrop);
    window.addEventListener('drop', onDragEndOrDrop);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onDragEndOrDrop);
    window.addEventListener('pointercancel', onDragEndOrDrop);

    return () => {
      scrollSpeed = 0;
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      window.removeEventListener('dragover', onDragOver);
      window.removeEventListener('dragend', onDragEndOrDrop);
      window.removeEventListener('drop', onDragEndOrDrop);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onDragEndOrDrop);
      window.removeEventListener('pointercancel', onDragEndOrDrop);
    };
  }, []);

  const handleOpenAddModal = (cat?: string) => {
    setPreselectedCategory(cat);
    setIsAddModalOpen(true);
  };

  const allExistingCategories = Array.from(
    new Set(resources.flatMap((r) => r.categories)),
  );

  const standardSections = ['Winter Games', 'Summer Games', 'General'];
  const nsoCategoriesWithResources = allExistingCategories.filter(
    (c) => !standardSections.includes(c),
  );

  const isCategoryEditing = (cat: string) => {
    return isGlobalEditing || !!categoryEditModes[cat];
  };

  const toggleCategoryEdit = (cat: string) => {
    const isCurrentlyEditing = isCategoryEditing(cat);
    setSelectedIds(new Set());

    if (isCurrentlyEditing) {
      if (isGlobalEditing) {
        const allCats = ['Winter Games', 'Summer Games', 'General', ...nsoCategoriesWithResources];
        const newModes: Record<string, boolean> = {};
        allCats.forEach((c) => {
          if (c !== cat) newModes[c] = true;
        });
        setCategoryEditModes(newModes);
        setIsGlobalEditing(false);
      } else {
        setCategoryEditModes((prev) => ({
          ...prev,
          [cat]: false,
        }));
      }
    } else {
      setCategoryEditModes((prev) => ({
        ...prev,
        [cat]: true,
      }));
    }
  };

  const toggleGlobalEdit = () => {
    const nextState = !isGlobalEditing;
    setIsGlobalEditing(nextState);
    setSelectedIds(new Set());
    setCategoryEditModes({});
  };

  const getFilteredCategoryResources = (category: string) => {
    return resources.filter((res) => {
      const belongsToCategory = res.categories.includes(category);
      if (!belongsToCategory) return false;
      if (!globalSearch.trim()) return true;

      const q = globalSearch.toLowerCase();
      return (
        res.name.toLowerCase().includes(q) ||
        res.categories.some((c) => c.toLowerCase().includes(q))
      );
    });
  };

  return (
    <div
      onDragOver={handleMainDragOver}
      onDrop={handlePageDrop}
      className="w-full min-h-screen bg-white pb-24"
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 pt-5 pb-3">
        <div className="flex items-center justify-end space-x-2.5">
          {isGlobalEditing && (
            <button
              type="button"
              disabled={selectedIds.size === 0}
              onClick={handleDeleteAllSelected}
              className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors flex items-center space-x-1.5 ${
                selectedIds.size > 0
                  ? 'bg-red-700 hover:bg-red-800 text-white cursor-pointer shadow-xs'
                  : 'bg-neutral-100 text-neutral-400 border border-neutral-200 cursor-not-allowed opacity-60'
              }`}
            >
              <svg
                className="w-4 h-4"
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
                Delete {selectedIds.size > 0 ? `(${selectedIds.size})` : ''}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={toggleGlobalEdit}
            className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors cursor-pointer ${
              isGlobalEditing
                ? 'bg-neutral-900 text-white ring-2 ring-neutral-400'
                : 'bg-[#374151] hover:bg-[#1f2937] text-white'
            }`}
          >
            {isGlobalEditing ? 'Done' : 'Edit'}
          </button>

          <button
            type="button"
            onClick={() => handleOpenAddModal()}
            className="px-4 py-1.5 rounded-md text-sm font-semibold bg-[#374151] hover:bg-[#1f2937] text-white transition-colors cursor-pointer"
          >
            Add
          </button>

          <div className="relative min-w-[220px] sm:min-w-[260px]">
            <input
              type="text"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder="Search by name, category..."
              className="w-full pl-4 pr-9 py-1.5 text-sm bg-white border border-[#80131d] rounded-full focus:outline-hidden focus:ring-2 focus:ring-[#80131d]/20 placeholder:text-neutral-500 transition-all"
            />
            {globalSearch ? (
              <button
                type="button"
                onClick={() => setGlobalSearch('')}
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

      <main
        onDragOver={handleMainDragOver}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setIsOverRemovalArea(false);
          }
        }}
        onDrop={(e) => {
          const targetElem = e.target as HTMLElement;
          const insideSection = Boolean(targetElem.closest('section'));
          if (!insideSection) {
            e.preventDefault();
            const resId =
              activeDragResourceIdRef.current ||
              activeDragResourceId ||
              globalActiveDragInfo?.resourceId;
            const cat =
              activeDragCategoryRef.current ||
              activeDragCategory ||
              globalActiveDragInfo?.sourceCategory;
            if (resId && cat) {
              handleRemoveCategoryFromResource(resId, cat);
              activeDragCategoryRef.current = null;
              activeDragResourceIdRef.current = null;
              isOverRemovalAreaRef.current = false;
              setActiveDragCategory(null);
              setActiveDragResourceId(null);
              setIsOverRemovalArea(false);
            }
          }
        }}
        className="max-w-[1600px] mx-auto px-4 sm:px-6 relative"
      >
        <CategorySection
          categoryTitle="Winter Games"
          resources={getFilteredCategoryResources('Winter Games')}
          isEditing={isCategoryEditing('Winter Games')}
          selectedIds={selectedIds}
          activeDragSourceCategory={activeDragCategory}
          activeDragResourceId={activeDragResourceId}
          activeMultiDragResourceIds={
            activeMultiDrag?.sourceCategory === 'Winter Games'
              ? activeMultiDrag.resourceIds
              : []
          }
          activeMultiDragHoveredCategory={activeMultiDrag?.hoveredCategoryTitle}
          activeMultiDragCount={activeMultiDrag?.resourceIds.length || 0}
          isOverRemovalArea={isOverRemovalArea}
          onToggleEdit={() => toggleCategoryEdit('Winter Games')}
          onOpenAddModal={() => handleOpenAddModal('Winter Games')}
          onToggleSelect={handleToggleSelect}
          onSelectMultiple={handleSelectMultiple}
          onUpdateSelectedIds={setSelectedIds}
          onDeleteSelected={() => handleDeleteSelectedInCategory('Winter Games')}
          onSelectResourceDetail={setDetailResource}
          onReorderResources={handleReorderResources}
          onStartDragCard={handleStartDragCard}
          onEndDragCard={handleEndDragCard}
          onStartMultiDrag={handleStartMultiDrag}
          onMoveMultiDrag={handleMoveMultiDrag}
          onEndMultiDrag={handleEndMultiDrag}
          onDropOnCategory={handleDropOnCategory}
          onRemoveFromCategory={handleRemoveFromCategory}
          onDragOverSection={handleHoverSection}
        />

        <CategorySection
          categoryTitle="Summer Games"
          resources={getFilteredCategoryResources('Summer Games')}
          isEditing={isCategoryEditing('Summer Games')}
          selectedIds={selectedIds}
          activeDragSourceCategory={activeDragCategory}
          activeDragResourceId={activeDragResourceId}
          activeMultiDragResourceIds={
            activeMultiDrag?.sourceCategory === 'Summer Games'
              ? activeMultiDrag.resourceIds
              : []
          }
          activeMultiDragHoveredCategory={activeMultiDrag?.hoveredCategoryTitle}
          activeMultiDragCount={activeMultiDrag?.resourceIds.length || 0}
          isOverRemovalArea={isOverRemovalArea}
          onToggleEdit={() => toggleCategoryEdit('Summer Games')}
          onOpenAddModal={() => handleOpenAddModal('Summer Games')}
          onToggleSelect={handleToggleSelect}
          onSelectMultiple={handleSelectMultiple}
          onUpdateSelectedIds={setSelectedIds}
          onDeleteSelected={() => handleDeleteSelectedInCategory('Summer Games')}
          onSelectResourceDetail={setDetailResource}
          onReorderResources={handleReorderResources}
          onStartDragCard={handleStartDragCard}
          onEndDragCard={handleEndDragCard}
          onStartMultiDrag={handleStartMultiDrag}
          onMoveMultiDrag={handleMoveMultiDrag}
          onEndMultiDrag={handleEndMultiDrag}
          onDropOnCategory={handleDropOnCategory}
          onRemoveFromCategory={handleRemoveFromCategory}
          onDragOverSection={handleHoverSection}
        />

        <CategorySection
          categoryTitle="General"
          resources={getFilteredCategoryResources('General')}
          isEditing={isCategoryEditing('General')}
          selectedIds={selectedIds}
          activeDragSourceCategory={activeDragCategory}
          activeDragResourceId={activeDragResourceId}
          activeMultiDragResourceIds={
            activeMultiDrag?.sourceCategory === 'General'
              ? activeMultiDrag.resourceIds
              : []
          }
          activeMultiDragHoveredCategory={activeMultiDrag?.hoveredCategoryTitle}
          activeMultiDragCount={activeMultiDrag?.resourceIds.length || 0}
          isOverRemovalArea={isOverRemovalArea}
          onToggleEdit={() => toggleCategoryEdit('General')}
          onOpenAddModal={() => handleOpenAddModal('General')}
          onToggleSelect={handleToggleSelect}
          onSelectMultiple={handleSelectMultiple}
          onUpdateSelectedIds={setSelectedIds}
          onDeleteSelected={() => handleDeleteSelectedInCategory('General')}
          onSelectResourceDetail={setDetailResource}
          onReorderResources={handleReorderResources}
          onStartDragCard={handleStartDragCard}
          onEndDragCard={handleEndDragCard}
          onStartMultiDrag={handleStartMultiDrag}
          onMoveMultiDrag={handleMoveMultiDrag}
          onEndMultiDrag={handleEndMultiDrag}
          onDropOnCategory={handleDropOnCategory}
          onRemoveFromCategory={handleRemoveFromCategory}
          onDragOverSection={handleHoverSection}
        />

        {nsoCategoriesWithResources.map((nsoCategory) => (
          <CategorySection
            key={nsoCategory}
            categoryTitle={nsoCategory}
            resources={getFilteredCategoryResources(nsoCategory)}
            isEditing={isCategoryEditing(nsoCategory)}
            selectedIds={selectedIds}
            activeDragSourceCategory={activeDragCategory}
            activeDragResourceId={activeDragResourceId}
            activeMultiDragResourceIds={
              activeMultiDrag?.sourceCategory === nsoCategory
                ? activeMultiDrag.resourceIds
                : []
            }
            activeMultiDragHoveredCategory={activeMultiDrag?.hoveredCategoryTitle}
            activeMultiDragCount={activeMultiDrag?.resourceIds.length || 0}
            isOverRemovalArea={isOverRemovalArea}
            onToggleEdit={() => toggleCategoryEdit(nsoCategory)}
            onOpenAddModal={() => handleOpenAddModal(nsoCategory)}
            onToggleSelect={handleToggleSelect}
            onSelectMultiple={handleSelectMultiple}
            onUpdateSelectedIds={setSelectedIds}
            onDeleteSelected={() => handleDeleteSelectedInCategory(nsoCategory)}
            onSelectResourceDetail={setDetailResource}
            onReorderResources={handleReorderResources}
            onStartDragCard={handleStartDragCard}
            onEndDragCard={handleEndDragCard}
            onStartMultiDrag={handleStartMultiDrag}
            onMoveMultiDrag={handleMoveMultiDrag}
            onEndMultiDrag={handleEndMultiDrag}
            onDropOnCategory={handleDropOnCategory}
            onRemoveFromCategory={handleRemoveFromCategory}
            onDragOverSection={handleHoverSection}
          />
        ))}
      </main>

      {activeMultiDrag && (
        <div
          data-testid="multi-drag-avatar"
          style={{
            position: 'fixed',
            left: `${activeMultiDrag.currentX}px`,
            top: `${activeMultiDrag.currentY}px`,
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            zIndex: 9999,
          }}
          className="select-none"
        >
          {activeMultiDrag.isOverRemoval ? (
            <div
              data-testid="drag-removal-symbol"
              className="w-36 h-36 sm:w-40 sm:h-40 rounded-3xl overflow-hidden shadow-2xl flex flex-col items-center justify-center bg-gradient-to-br from-red-600 via-red-700 to-red-900 text-white p-3 ring-4 ring-red-400 animate-pulse"
            >
              <svg
                className="w-14 h-14 text-white drop-shadow-lg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              <span className="mt-1 text-center text-xs font-bold uppercase tracking-wider text-red-100 drop-shadow-xs px-2 leading-tight">
                {activeMultiDrag.resourceIds.length > 1
                  ? `Remove ${activeMultiDrag.resourceIds.length} from Category`
                  : 'Remove from Category'}
              </span>
            </div>
          ) : (
            <div className="relative pointer-events-none">
              {activeMultiDrag.resourceIds.slice(1).map((rId, idx) => {
                const res = resources.find((r) => r.id === rId);
                const offset = Math.min((idx + 1) * 8, 48);
                const rot = Math.min((idx + 1) * 3, 18);
                return (
                  <div
                    key={rId}
                    style={{
                      position: 'absolute',
                      top: `${offset}px`,
                      left: `${offset}px`,
                      transform: `rotate(${rot}deg)`,
                    }}
                    className="w-36 h-36 sm:w-40 sm:h-40 rounded-3xl overflow-hidden shadow-xl bg-gradient-to-br from-[#80131d] to-[#4a0a10] ring-2 ring-white/70 flex flex-col items-center justify-center p-3 text-center"
                  >
                    {res?.previewUrl && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={res.previewUrl}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover opacity-25 pointer-events-none"
                      />
                    )}
                    <span className="text-white/90 font-bold text-xs sm:text-sm tracking-tight leading-snug line-clamp-2 px-2 z-10">
                      {res?.name || 'Selected item'}
                    </span>
                  </div>
                );
              })}

              <div className="relative w-36 h-36 sm:w-40 sm:h-40 rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-[#80131d] to-[#4a0a10] ring-4 ring-white/90 flex flex-col items-center justify-center p-3 text-center">
                {resources.find((r) => r.id === activeMultiDrag.resourceIds[0])?.previewUrl && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={resources.find((r) => r.id === activeMultiDrag.resourceIds[0])?.previewUrl}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none"
                  />
                )}
                <span className="text-white font-bold text-base sm:text-lg tracking-tight leading-snug drop-shadow-md line-clamp-2 px-2 z-10">
                  {resources.find((r) => r.id === activeMultiDrag.resourceIds[0])?.name || 'Selected items'}
                </span>
                {activeMultiDrag.hoveredCategoryTitle &&
                activeMultiDrag.hoveredCategoryTitle !== activeMultiDrag.sourceCategory ? (
                  <span className="mt-2 text-xs bg-white text-[#80131d] font-bold px-2.5 py-0.5 rounded-full shadow-md z-10 animate-bounce">
                    + Add to {activeMultiDrag.hoveredCategoryTitle}
                  </span>
                ) : (
                  <span className="mt-2 text-xs bg-black/70 text-white font-semibold px-2 py-0.5 rounded-full z-10 shadow-xs">
                    {activeMultiDrag.resourceIds.length} {activeMultiDrag.resourceIds.length === 1 ? 'item' : 'items'}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900/95 backdrop-blur-xs text-white px-4 py-2.5 rounded-lg shadow-xl text-sm font-medium flex items-center space-x-2 border border-neutral-700 transition-all duration-300 animate-slide-up">
          <svg
            className="w-4 h-4 text-emerald-400 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}

      <AddResourceModal
        isOpen={isAddModalOpen}
        preselectedCategory={preselectedCategory}
        onClose={() => setIsAddModalOpen(false)}
        onAddResource={handleAddResource}
      />

      <ResourceDetailModal
        resource={detailResource}
        onClose={() => setDetailResource(null)}
      />
    </div>
  );
}
export default ResourcesPageContent;
