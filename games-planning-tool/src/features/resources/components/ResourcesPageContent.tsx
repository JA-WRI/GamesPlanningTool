// 50% or more AI-generated
'use client';

import React, { useState, useMemo, useRef } from 'react';
import {
  Resource,
  FolderResource,
  FileResource,
  NewResourceInput,
} from '@/features/resources/types/resource';
import { getDescendantResourceIds } from '@/lib/resources-data';
import {
  createFileResource,
  createFolder,
  createLinkResource,
  deleteResources,
  moveResources,
  renameResource,
  reorderResources,
  updateResourceCategories,
} from '../actions';
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
  initialResources: Resource[];
  isReadOnly?: boolean;
}

// Exceeds 50 lines: one component wires page state, drag-and-drop, and all modals together.
export function ResourcesPageContent({
  initialResources,
  isReadOnly = false,
}: ResourcesPageContentProps) {
  const [resources, setResources] = useState(initialResources);

  const [globalSearch, setGlobalSearch] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modal states...
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addResourceFolderId, setAddResourceFolderId] = useState<string>();
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
    onMoveResourceToFolder: async (id, folderId) => {
      setResources(await moveResources([id], folderId));
    },
    onReorderResources: async (ordered) => {
      setResources(
        await reorderResources(
          null,
          ordered.map((r) => r.id),
        ),
      );
    },
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

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    const count = selectedIds.size;
    if (
      typeof window !== 'undefined' &&
      !window.confirm(`Delete ${count} resource${count === 1 ? '' : 's'}?`)
    )
      return;
    setResources(await deleteResources([...selectedIds]));
    setSelectedIds(new Set());
    setIsEditing(false);
    showToast(`Deleted ${count} resource${count === 1 ? '' : 's'}`);
  };

  const handleAddResource = async (input: NewResourceInput) => {
    if (input.type === 'link') {
      setResources(
        await createLinkResource({
          name: input.name,
          url: input.url,
          categories: input.categories,
          parentId: input.parentId,
        }),
      );
    } else {
      const formData = new FormData();
      formData.set('name', input.name);
      formData.set('categories', JSON.stringify(input.categories));
      if (input.parentId) formData.set('parentId', input.parentId);
      formData.set('file', input.file);
      setResources(await createFileResource(formData));
    }

    setIsAddModalOpen(false);
    showToast('Resource added successfully');
  };

  const handleRenameResource = async (id: string, newName: string) => {
    setResources(await renameResource(id, newName));
    showToast('Renamed successfully');
  };

  const handleCategoriesChange = async (
    id: string,
    newCategories: string[],
  ) => {
    setResources(await updateResourceCategories(id, newCategories));
    showToast('Categories updated');
  };

  const handleCreateFolderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newFolderNameInput.trim();
    if (trimmed) {
      setResources(await createFolder({ name: trimmed }));
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
        preselectedFolderId={addResourceFolderId}
        onClose={() => {
          setIsAddModalOpen(false);
          setAddResourceFolderId(undefined);
        }}
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
          onCreateSubfolder={async (name, parentId) => {
            setResources(await createFolder({ name, parentId }));
          }}
          onAddResourceToFolder={(folderId) => {
            setAddResourceFolderId(folderId);
            setIsAddModalOpen(true);
          }}
          onMoveResourceToFolder={async (ids, targetFolderId) => {
            droppedInFolderRef.current = true;
            dragDroppedSuccessfullyRef.current = true;
            setDraggedCardId(null);
            draggedCardIdRef.current = null;
            setIsEditing(false);
            setResources(await moveResources(ids, targetFolderId));
            showToast(`Moved ${ids.length} item(s)`);
          }}
          onReorderInFolder={async (parentId, orderedChildren) => {
            droppedInFolderRef.current = true;
            setResources(
              await reorderResources(
                parentId,
                orderedChildren.map((r) => r.id),
              ),
            );
          }}
          onRenameResource={handleRenameResource}
          onDeleteResources={async (ids) => {
            setResources(await deleteResources(ids));
            showToast(
              `Deleted ${ids.length} item${ids.length === 1 ? '' : 's'}`,
            );
          }}
          onDropOnMainPage={async (ids, targetId) => {
            const target = resources.find((r) => r.id === targetId);

            if (target?.type === 'folder') {
              setResources(await moveResources(ids, target.id));
              showToast(`Moved ${ids.length} item(s) to folder`);
              return;
            }

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
              const itemsToInsert = updated.filter((r) => ids.includes(r.id));
              if (targetIndex !== -1) {
                newLocalOrdered.splice(targetIndex, 0, ...itemsToInsert);
              } else {
                newLocalOrdered.push(...itemsToInsert);
              }
              updated = [...otherResources, ...newLocalOrdered];
            }

            await moveResources(ids, null);
            setResources(
              await reorderResources(
                null,
                updated.filter((r) => !r.parentId).map((r) => r.id),
              ),
            );
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
