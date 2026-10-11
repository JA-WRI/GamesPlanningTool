// Made with AI agents (Antigravity)
'use client';

import React, {
  useState,
  useRef,
  useMemo,
  useEffect,
  useSyncExternalStore,
} from 'react';
import { Resource, FolderResource } from '@/types/resource';
import {
  INITIAL_RESOURCES,
  subscribeToResources,
  getCachedResources,
  saveResourcesToStorage,
  createFolder,
  getDescendantResourceIds,
} from '@/lib/resources-data';
import { AddResourceModal } from './AddResourceModal';
import { ResourceDetailModal } from './ResourceDetailModal';
import { FolderDirectoryModal } from './FolderDirectoryModal';
import { SearchPill } from './SearchPill';
import { useSweepSelection } from './useSweepSelection';
import { ResourceCard } from './ResourceCard';

export function ResourcesPageContent() {
  const resources = useSyncExternalStore(
    subscribeToResources,
    getCachedResources,
    () => INITIAL_RESOURCES,
  );

  const [globalSearch, setGlobalSearch] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modal states...
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [detailResource, setDetailResource] = useState<Resource | null>(null);
  const [activeDirectoryFolder, setActiveDirectoryFolder] =
    useState<FolderResource | null>(null);
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [newFolderNameInput, setNewFolderNameInput] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Top Level Resource Filtering
  const filteredResources = useMemo(() => {
    return resources.filter((res) => {
      if (res.parentId) return false;

      if (!globalSearch.trim()) return true;
      const q = globalSearch.toLowerCase();
      return (
        res.name.toLowerCase().includes(q) ||
        res.categories.some((c) => c.toLowerCase().includes(q))
      );
    });
  }, [resources, globalSearch]);

  // Drag and Reorder state
  const [localOrderedResources, setLocalOrderedResources] =
    useState<Resource[]>(filteredResources);
  const localOrderedRef = useRef<Resource[]>(filteredResources);
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const draggedCardIdRef = useRef<string | null>(null);
  const [externalPointerDraggedIds, setExternalPointerDraggedIds] = useState<
    string[]
  >([]);
  const externalPointerDraggedIdsRef = useRef<string[]>([]);
  const [hoverFolderDropTargetId, setHoverFolderDropTargetId] = useState<
    string | null
  >(null);
  const hoverFolderDropTargetIdRef = useRef<string | null>(null);
  const dragDroppedSuccessfullyRef = useRef(false);
  const droppedInFolderRef = useRef(false);
  const springLoadTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!draggedCardIdRef.current) {
      setLocalOrderedResources(filteredResources);
      localOrderedRef.current = filteredResources;
    }
  }, [filteredResources]);

  const updateResources = (newResources: Resource[]) =>
    saveResourcesToStorage(newResources);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    if (selectedIds.size > 0) {
      e.preventDefault();
      return;
    }
    draggedCardIdRef.current = id;
    setDraggedCardId(id);
    setIsEditing(true);
    dragDroppedSuccessfullyRef.current = false;
    droppedInFolderRef.current = false;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const sourceId = draggedCardIdRef.current;
    if (!sourceId || sourceId === targetId) return;

    const targetResource = localOrderedResources.find((r) => r.id === targetId);
    if (targetResource?.type === 'folder') {
      const rect = e.currentTarget.getBoundingClientRect();
      const relativeX = (e.clientX - rect.left) / rect.width;

      const isCurrentlyHoveredFolder =
        hoverFolderDropTargetIdRef.current === targetId;
      const minX = isCurrentlyHoveredFolder ? 0.05 : 0.15;
      const maxX = isCurrentlyHoveredFolder ? 0.95 : 0.85;

      if (relativeX >= minX && relativeX <= maxX) {
        if (hoverFolderDropTargetIdRef.current !== targetId) {
          setHoverFolderDropTargetId(targetId);
          hoverFolderDropTargetIdRef.current = targetId;
          if (springLoadTimeoutRef.current)
            clearTimeout(springLoadTimeoutRef.current);
          springLoadTimeoutRef.current = setTimeout(() => {
            if (targetResource)
              setActiveDirectoryFolder({ ...targetResource } as FolderResource);
            setHoverFolderDropTargetId(null);
            hoverFolderDropTargetIdRef.current = null;
          }, 600);
        }
        return;
      }
    }
    if (springLoadTimeoutRef.current) {
      clearTimeout(springLoadTimeoutRef.current);
      springLoadTimeoutRef.current = null;
    }
    setHoverFolderDropTargetId(null);
    hoverFolderDropTargetIdRef.current = null;

    if (selectedIds.size === 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      const midX = rect.left + rect.width / 2;
      const clientX = e.clientX;
      setLocalOrderedResources((currentList) => {
        const sourceIdx = currentList.findIndex((r) => r.id === sourceId);
        const targetIdx = currentList.findIndex((r) => r.id === targetId);
        if (sourceIdx === -1 || targetIdx === -1 || sourceIdx === targetIdx)
          return currentList;
        if (sourceIdx < targetIdx && clientX < midX) return currentList;
        if (sourceIdx > targetIdx && clientX > midX) return currentList;
        const updated = [...currentList];
        const [movedItem] = updated.splice(sourceIdx, 1);
        updated.splice(targetIdx, 0, movedItem);
        localOrderedRef.current = updated;
        return updated;
      });
    }
  };

  const handleDrop = (e: React.DragEvent, targetId?: string) => {
    e.preventDefault();
    dragDroppedSuccessfullyRef.current = true;
    const itemToMove = draggedCardIdRef.current;
    const folderDropTarget =
      hoverFolderDropTargetId ||
      (targetId &&
      localOrderedResources.find((r) => r.id === targetId)?.type === 'folder'
        ? targetId
        : null);

    if (folderDropTarget && itemToMove && itemToMove !== folderDropTarget) {
      const updated = resources.map((r) =>
        r.id === itemToMove ? { ...r, parentId: folderDropTarget } : r,
      );
      updateResources(updated);
      showToast('Moved item into folder');
    } else if (itemToMove && selectedIds.size === 0) {
      const reorderedIds = new Set(localOrderedRef.current.map((r) => r.id));
      const otherResources = resources.filter((r) => !reorderedIds.has(r.id));
      updateResources([...otherResources, ...localOrderedRef.current]);
    }
    setDraggedCardId(null);
    draggedCardIdRef.current = null;
    setHoverFolderDropTargetId(null);
    setActiveDirectoryFolder(null);
    setIsEditing(false);
  };

  const handleDragEnd = () => {
    if (!dragDroppedSuccessfullyRef.current) {
      setLocalOrderedResources(filteredResources);
      localOrderedRef.current = filteredResources;
    }
    setDraggedCardId(null);
    draggedCardIdRef.current = null;
    setHoverFolderDropTargetId(null);
    if (!droppedInFolderRef.current) {
      setActiveDirectoryFolder(null);
    }
    droppedInFolderRef.current = false;
    setIsEditing(false);
  };

  const handlePointerHoverMainPage = (
    clientX: number,
    clientY: number,
    draggedIds: string[],
    dropped?: boolean,
  ) => {
    if (
      externalPointerDraggedIdsRef.current.join(',') !== draggedIds.join(',')
    ) {
      externalPointerDraggedIdsRef.current = draggedIds;
      setExternalPointerDraggedIds(draggedIds);
    }

    if (draggedIds.length === 0) {
      if (!dropped) {
        setLocalOrderedResources((currentList) => {
          let hasChanges = currentList.length !== filteredResources.length;
          if (!hasChanges) {
            for (let i = 0; i < currentList.length; i++) {
              if (currentList[i].id !== filteredResources[i].id) {
                hasChanges = true;
                break;
              }
            }
          }
          if (!hasChanges) return currentList;
          localOrderedRef.current = filteredResources;
          return filteredResources;
        });
      }
      return;
    }

    const elem = document.elementFromPoint(clientX, clientY);
    const targetCard = elem?.closest('[data-resource-id]');
    const targetId = targetCard?.getAttribute('data-resource-id');
    const targetType = targetCard?.getAttribute('data-resource-type');

    if (!targetCard || !targetId || draggedIds.includes(targetId)) {
      if (hoverFolderDropTargetIdRef.current !== null) {
        setHoverFolderDropTargetId(null);
        hoverFolderDropTargetIdRef.current = null;
        if (springLoadTimeoutRef.current)
          clearTimeout(springLoadTimeoutRef.current);
      }
      return;
    }

    const rect = targetCard.getBoundingClientRect();
    const relativeX = (clientX - rect.left) / rect.width;

    const isCurrentlyHoveredFolder =
      hoverFolderDropTargetIdRef.current === targetId;
    const minX = isCurrentlyHoveredFolder ? 0.05 : 0.15;
    const maxX = isCurrentlyHoveredFolder ? 0.95 : 0.85;

    if (targetType === 'folder' && relativeX >= minX && relativeX <= maxX) {
      if (hoverFolderDropTargetIdRef.current !== targetId) {
        setHoverFolderDropTargetId(targetId);
        hoverFolderDropTargetIdRef.current = targetId;
        if (springLoadTimeoutRef.current)
          clearTimeout(springLoadTimeoutRef.current);
        springLoadTimeoutRef.current = setTimeout(() => {
          const targetResource = localOrderedRef.current.find(
            (r) => r.id === targetId,
          );
          if (targetResource)
            setActiveDirectoryFolder({ ...targetResource } as FolderResource);
          setHoverFolderDropTargetId(null);
          hoverFolderDropTargetIdRef.current = null;
        }, 600);
      }
      return;
    }

    if (hoverFolderDropTargetIdRef.current !== null) {
      setHoverFolderDropTargetId(null);
      hoverFolderDropTargetIdRef.current = null;
      if (springLoadTimeoutRef.current)
        clearTimeout(springLoadTimeoutRef.current);
    }

    const midX = rect.left + rect.width / 2;
    const insertAfter = clientX > midX;

    setLocalOrderedResources((currentList) => {
      const newList = currentList.filter((r) => !draggedIds.includes(r.id));

      const targetIdx = newList.findIndex((r) => r.id === targetId);
      if (targetIdx === -1) return currentList;

      const itemsToInject = draggedIds
        .map((id) => resources.find((r) => r.id === id))
        .filter(Boolean) as Resource[];
      if (itemsToInject.length === 0) return currentList;

      newList.splice(targetIdx + (insertAfter ? 1 : 0), 0, ...itemsToInject);

      let hasChanges = newList.length !== currentList.length;
      if (!hasChanges) {
        for (let i = 0; i < newList.length; i++) {
          if (newList[i].id !== currentList[i].id) {
            hasChanges = true;
            break;
          }
        }
      }
      if (!hasChanges) return currentList;

      localOrderedRef.current = newList;
      return newList;
    });
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const scrollContainerRef = React.useRef<HTMLDivElement | null>(null);
  const {
    handleSweepPointerDown,
    handleCardPointerDown,
    justFinishedSweepRef,
  } = useSweepSelection(
    localOrderedResources,
    selectedIds,
    setSelectedIds,
    undefined,
    isEditing,
    scrollContainerRef,
  );

  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return;
    if (
      typeof window !== 'undefined' &&
      !window.confirm(
        `Delete ${selectedIds.size} resource${selectedIds.size === 1 ? '' : 's'}?`,
      )
    )
      return;
    const updated = resources.filter((r) => !selectedIds.has(r.id));
    updateResources(updated);
    setSelectedIds(new Set());
    setIsEditing(false);
    showToast(
      `Deleted ${selectedIds.size} resource${selectedIds.size === 1 ? '' : 's'}`,
    );
  };

  const handleAddResource = (newRes: Resource) => {
    updateResources([...resources, newRes]);
    setIsAddModalOpen(false);
    showToast('Resource added successfully');
  };

  const handleRenameResource = (id: string, newName: string) => {
    updateResources(
      resources.map((r) => (r.id === id ? { ...r, name: newName } : r)),
    );
    showToast('Renamed successfully');
  };

  const handleCategoriesChange = (id: string, newCategories: string[]) => {
    updateResources(
      resources.map((r) =>
        r.id === id ? { ...r, categories: newCategories } : r,
      ),
    );
    showToast('Categories updated');
  };

  const handleCreateFolderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newFolderNameInput.trim();
    if (trimmed) {
      const folder = createFolder(trimmed, []);
      updateResources([...resources, folder]);
      showToast('Folder created');
    }
    setNewFolderNameInput('');
    setIsCreateFolderModalOpen(false);
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500 pb-32 h-full flex flex-col">
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-neutral-900 text-white px-6 py-3 rounded-full shadow-2xl font-medium text-sm z-50 animate-in slide-in-from-bottom-5">
          {toastMessage}
        </div>
      )}

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">
          Resources Dashboard
        </h1>
        <div className="flex flex-wrap items-center gap-3">
          <SearchPill value={globalSearch} onChange={setGlobalSearch} />
          {isEditing && selectedIds.size > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="px-3.5 py-1.5 text-sm font-semibold rounded-md bg-red-700 text-white hover:bg-red-800 transition-colors"
            >
              Delete ({selectedIds.size})
            </button>
          )}
          <button
            onClick={() => {
              setIsEditing(!isEditing);
              setSelectedIds(new Set());
            }}
            className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${isEditing ? 'bg-neutral-900 text-white' : 'bg-neutral-200 text-neutral-800 hover:bg-neutral-300'}`}
          >
            {isEditing ? 'Done' : 'Edit'}
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-1.5 rounded-md text-sm font-semibold bg-[#374151] hover:bg-[#1f2937] text-white"
          >
            Add Resource
          </button>
          <button
            onClick={() => setIsCreateFolderModalOpen(true)}
            className="px-3.5 py-1.5 rounded-md text-sm font-semibold bg-[#374151] hover:bg-[#1f2937] text-white"
          >
            Create Folder
          </button>
        </div>
      </div>

      {/* Single Wrapping Grid layout */}
      <div
        className="bg-[#E8ECEF] rounded-md p-4 sm:p-5 relative flex-1"
        ref={scrollContainerRef}
      >
        {localOrderedResources.length === 0 ? (
          <div className="py-10 text-center text-neutral-500 font-medium">
            No resources match your criteria.
          </div>
        ) : (
          <div
            className="grid gap-4 items-end"
            style={{
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, undefined)}
          >
            {localOrderedResources.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                isEditing={isEditing}
                isSelected={selectedIds.has(resource.id)}
                canReorder={isEditing && selectedIds.size === 0}
                canDrag={selectedIds.size === 0}
                isDraggingThisCard={
                  draggedCardId === resource.id ||
                  externalPointerDraggedIds.includes(resource.id)
                }
                showRemovalSymbol={false}
                isFolderDropTarget={hoverFolderDropTargetId === resource.id}
                itemCount={
                  resource.type === 'folder'
                    ? getDescendantResourceIds(resources, resource.id).length
                    : undefined
                }
                onToggleSelect={() => {
                  if (!justFinishedSweepRef.current)
                    handleToggleSelect(resource.id);
                }}
                onRoundButtonPointerDown={(e) =>
                  handleSweepPointerDown(e.clientX, e.clientY, resource.id)
                }
                onRoundButtonClick={() => {
                  if (!justFinishedSweepRef.current)
                    handleToggleSelect(resource.id);
                }}
                onCardPointerDown={(e) => handleCardPointerDown(e, resource.id)}
                onClick={(res) => {
                  if (res.type === 'folder')
                    setActiveDirectoryFolder(res as FolderResource);
                  else setDetailResource(res);
                }}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                onDrop={handleDrop}
                onRename={handleRenameResource}
              />
            ))}
          </div>
        )}
      </div>

      <AddResourceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddResource={handleAddResource}
      />

      <ResourceDetailModal
        resource={
          detailResource
            ? (resources.find((r) => r.id === detailResource.id) ??
              detailResource)
            : null
        }
        onClose={() => setDetailResource(null)}
        onRename={handleRenameResource}
        onCategoriesChange={handleCategoriesChange}
      />

      {activeDirectoryFolder && (
        <FolderDirectoryModal
          folder={activeDirectoryFolder}
          allResources={resources}
          currentCategory="Global"
          onClose={() => setActiveDirectoryFolder(null)}
          onSelectResourceDetail={setDetailResource}
          onCreateSubfolder={(name, _parentId) => {
            const folder = createFolder(name, []);
            updateResources([...resources, { ...folder, parentId: _parentId }]);
          }}
          onAddResourceToFolder={() => {
            setIsAddModalOpen(true);
          }}
          onMoveResourceToFolder={(ids, targetFolderId) => {
            droppedInFolderRef.current = true;
            dragDroppedSuccessfullyRef.current = true;
            setDraggedCardId(null);
            draggedCardIdRef.current = null;
            setIsEditing(false);
            const updated = resources.map((r) =>
              ids.includes(r.id)
                ? { ...r, parentId: targetFolderId || undefined }
                : r,
            );
            updateResources(updated);
            showToast(`Moved ${ids.length} item(s)`);
          }}
          onReorderInFolder={(orderedChildren) => {
            droppedInFolderRef.current = true;
            const orderedIds = new Set(orderedChildren.map((r) => r.id));
            const otherResources = resources.filter(
              (r) => !orderedIds.has(r.id),
            );
            updateResources([...otherResources, ...orderedChildren]);
          }}
          onRenameResource={handleRenameResource}
          onDeleteResources={(ids) => {
            const idsToDelete = new Set(ids);
            const updated = resources.filter((r) => !idsToDelete.has(r.id));
            updateResources(updated);
            showToast(
              `Deleted ${ids.length} item${ids.length === 1 ? '' : 's'}`,
            );
          }}
          onDropOnMainPage={(ids, targetId) => {
            let updated = resources.map((r) =>
              ids.includes(r.id) ? { ...r, parentId: null } : r,
            );

            const hasInjected = ids.some((id) =>
              localOrderedRef.current.some((lr) => lr.id === id),
            );
            if (hasInjected) {
              const reorderedIds = new Set(
                localOrderedRef.current.map((r) => r.id),
              );
              const otherResources = updated.filter(
                (r) => !reorderedIds.has(r.id),
              );
              const finalOrdered = localOrderedRef.current
                .map((lr) => updated.find((u) => u.id === lr.id) || lr)
                .filter(Boolean) as Resource[];
              updated = [...otherResources, ...finalOrdered];
            } else if (targetId) {
              const targetResource = resources.find((r) => r.id === targetId);
              if (targetResource?.type === 'folder') {
                updated = [
                  ...resources.filter((r) => !ids.includes(r.id)),
                  ...(ids
                    .map((id) => {
                      const r = resources.find((x) => x.id === id);
                      return r ? { ...r, parentId: targetId } : null;
                    })
                    .filter(Boolean) as Resource[]),
                ];
                updateResources(updated);
                showToast(`Moved ${ids.length} item(s) to folder`);
                return;
              }

              const reorderedIds = new Set(
                localOrderedRef.current.map((r) => r.id),
              );
              const otherResources = updated.filter(
                (r) => !reorderedIds.has(r.id),
              );
              let newLocalOrdered = [...localOrderedRef.current];
              newLocalOrdered = newLocalOrdered.filter(
                (r) => !ids.includes(r.id),
              );
              const targetIndex = newLocalOrdered.findIndex(
                (r) => r.id === targetId,
              );
              if (targetIndex !== -1) {
                const itemsToInsert = updated.filter((r) => ids.includes(r.id));
                newLocalOrdered.splice(targetIndex, 0, ...itemsToInsert);
              } else {
                const itemsToInsert = updated.filter((r) => ids.includes(r.id));
                newLocalOrdered.push(...itemsToInsert);
              }
              updated = [...otherResources, ...newLocalOrdered];
            }
            updateResources(updated);
            showToast(`Moved ${ids.length} item(s) to main dashboard`);
          }}
          onCategoriesChange={handleCategoriesChange}
          externalDraggedId={draggedCardId}
          onPointerHoverMainPage={handlePointerHoverMainPage}
        />
      )}

      {isCreateFolderModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-folder-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <button
            type="button"
            tabIndex={-1}
            aria-label="Close dialog"
            className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in cursor-default border-none"
            onClick={() => setIsCreateFolderModalOpen(false)}
          />
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden z-10 p-6 space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-amber-100 rounded-lg text-amber-700">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                </svg>
              </div>
              <h3
                id="create-folder-title"
                className="text-lg font-bold text-neutral-900"
              >
                New Folder
              </h3>
            </div>
            <form onSubmit={handleCreateFolderSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="new-folder-name"
                  className="block text-xs font-semibold text-neutral-700 mb-1"
                >
                  Folder Name
                </label>
                <input
                  id="new-folder-name"
                  type="text"
                  autoFocus
                  required
                  placeholder="e.g. Venue Maps"
                  value={newFolderNameInput}
                  onChange={(e) => setNewFolderNameInput(e.target.value)}
                  className="w-full text-sm bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-2 text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-[#80131d]"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCreateFolderModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg text-neutral-700 hover:bg-neutral-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#80131d] hover:bg-[#600f16] text-white transition-colors cursor-pointer shadow-xs"
                >
                  Create Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
export default ResourcesPageContent;
