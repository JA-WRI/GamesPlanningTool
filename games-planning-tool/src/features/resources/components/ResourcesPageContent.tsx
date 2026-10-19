// Made with AI agents (Antigravity)
'use client';

import React, { useState, useMemo, useSyncExternalStore, useRef } from 'react';
import {
  Resource,
  FolderResource,
  FileResource,
} from '@/features/resources/types/resource';
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
import { EditCategoriesModal } from './EditCategoriesModal';
import { useSweepSelection } from '@/features/resources/hooks/useSweepSelection';
import { useResourcesDragAndDrop } from '@/features/resources/hooks/useResourcesDragAndDrop';
import { ResourceCard } from './ResourceCard';
import { ResourcesToolbar } from './ResourcesToolbar';
import { CreateFolderModal } from './CreateFolderModal';

export interface ResourcesPageContentProps {
  isReadOnly?: boolean;
}

export function ResourcesPageContent({
  isReadOnly = false,
}: ResourcesPageContentProps = {}) {
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
  const [categoryEditResource, setCategoryEditResource] =
    useState<Resource | null>(null);
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

  const updateResources = (newResources: Resource[]) =>
    saveResourcesToStorage(newResources);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const {
    localOrderedResources,
    localOrderedRef,
    draggedCardId,
    setDraggedCardId,
    draggedCardIdRef,
    externalPointerDraggedIds,
    hoverFolderDropTargetId,
    droppedInFolderRef,
    dragDroppedSuccessfullyRef,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
    handlePointerHoverMainPage,
  } = useResourcesDragAndDrop({
    filteredResources,
    allResources: resources,
    isReadOnly,
    selectedIds,
    updateResources,
    showToast,
    setActiveDirectoryFolder,
    setIsEditing,
  });

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
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

  const handleResourceClick = (res: Resource) => {
    if (res.type === 'folder') {
      setActiveDirectoryFolder(res as FolderResource);
    } else if (res.type === 'link') {
      if (res.URL) {
        window.open(res.URL, '_blank', 'noopener,noreferrer');
      }
    } else if (res.type === 'file') {
      const url = (res as FileResource).fileUrl || '#';
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500 pb-32 h-full flex flex-col">
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-neutral-900 text-white px-6 py-3 rounded-full shadow-2xl font-medium text-sm z-50 animate-in slide-in-from-bottom-5">
          {toastMessage}
        </div>
      )}

      <ResourcesToolbar
        globalSearch={globalSearch}
        setGlobalSearch={setGlobalSearch}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
        handleDeleteSelected={handleDeleteSelected}
        setIsAddModalOpen={setIsAddModalOpen}
        setIsCreateFolderModalOpen={setIsCreateFolderModalOpen}
        isReadOnly={isReadOnly}
      />

      {/* Single Wrapping Grid layout with clean white background */}
      <div
        className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 relative flex-1"
        ref={scrollContainerRef}
      >
        {localOrderedResources.length === 0 ? (
          <div className="py-10 text-center text-neutral-500 font-medium">
            No resources match your criteria.
          </div>
        ) : (
          <div
            className="grid gap-3 sm:gap-4 items-start pt-2"
            style={{
              gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))',
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
                canReorder={!isReadOnly && isEditing && selectedIds.size === 0}
                canDrag={!isReadOnly && selectedIds.size === 0}
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
                  if (!isReadOnly && !justFinishedSweepRef.current)
                    handleToggleSelect(resource.id);
                }}
                onRoundButtonPointerDown={(e) => {
                  if (!isReadOnly)
                    handleSweepPointerDown(e.clientX, e.clientY, resource.id);
                }}
                onRoundButtonClick={() => {
                  if (!isReadOnly && !justFinishedSweepRef.current)
                    handleToggleSelect(resource.id);
                }}
                onCardPointerDown={(e) => {
                  if (!isReadOnly) handleCardPointerDown(e, resource.id);
                }}
                onClick={handleResourceClick}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                onDrop={handleDrop}
                onRename={isReadOnly ? undefined : handleRenameResource}
                onEditCategories={
                  isReadOnly ? undefined : (res) => setCategoryEditResource(res)
                }
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
        onRename={isReadOnly ? undefined : handleRenameResource}
        onCategoriesChange={isReadOnly ? undefined : handleCategoriesChange}
      />

      <EditCategoriesModal
        resource={
          categoryEditResource
            ? (resources.find((r) => r.id === categoryEditResource.id) ??
              categoryEditResource)
            : null
        }
        onClose={() => setCategoryEditResource(null)}
        onSave={handleCategoriesChange}
      />

      {activeDirectoryFolder && (
        <FolderDirectoryModal
          folder={
            (resources.find(
              (r) => r.id === activeDirectoryFolder.id,
            ) as FolderResource) ?? activeDirectoryFolder
          }
          allResources={resources}
          currentCategory="Global"
          isReadOnly={isReadOnly}
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

      <CreateFolderModal
        isOpen={isCreateFolderModalOpen}
        folderName={newFolderNameInput}
        setFolderName={setNewFolderNameInput}
        onClose={() => setIsCreateFolderModalOpen(false)}
        onSubmit={handleCreateFolderSubmit}
      />
    </div>
  );
}

export default ResourcesPageContent;
