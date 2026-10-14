// Made with AI agents (Antigravity)
'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import { Resource, FolderResource, FileResource } from '@/types/resource';
import { getFolderChildren } from '@/lib/resources-data';
import ResourceCard from './ResourceCard';
import { useSweepSelection } from './useSweepSelection';
import { FolderModalHeader } from './folder-modal/FolderModalHeader';
import { FolderModalToolbar } from './folder-modal/FolderModalToolbar';
import { useFolderModalDrag } from './folder-modal/useFolderModalDrag';
import { FolderDragGhost } from './folder-modal/FolderDragGhost';
import { getFolderBreadcrumbs } from './folder-modal/folderModalDragHelpers';
import { EditCategoriesModal } from './EditCategoriesModal';

export interface FolderDirectoryModalProps {
  folder: FolderResource | null;
  allResources: Resource[];
  filterPredicate?: (resource: Resource) => boolean;
  externalDraggedId?: string | null;
  currentCategory?: string;
  isReadOnly?: boolean;
  onClose: () => void;
  onSelectResourceDetail: (resource: Resource) => void;
  onMoveResourceToFolder: (
    resourceIds: string[],
    targetFolderId: string | null,
  ) => void;
  onReorderInFolder: (updatedChildren: Resource[]) => void;
  onAddResourceToFolder: (folderId: string) => void;
  onCreateSubfolder: (name: string, parentId: string) => void;
  onRenameResource?: (id: string, newName: string) => void;
  onDeleteResources?: (ids: string[]) => void;
  onCategoriesChange?: (folderId: string, categories: string[]) => void;
  onDropOnMainPage?: (ids: string[], targetId: string | null) => void;
  onPointerHoverMainPage?: (
    clientX: number,
    clientY: number,
    ids: string[],
    isDrop?: boolean,
  ) => void;
}

export function FolderDirectoryModal({
  folder,
  allResources,
  filterPredicate,
  externalDraggedId,
  isReadOnly = false,
  onClose,
  onSelectResourceDetail,
  onMoveResourceToFolder,
  onReorderInFolder,
  onAddResourceToFolder,
  onCreateSubfolder,
  onRenameResource,
  onDeleteResources,
  onCategoriesChange,
  onDropOnMainPage,
  onPointerHoverMainPage,
}: FolderDirectoryModalProps) {
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(
    folder?.id || null,
  );
  const [isEditingFolder, setIsEditingFolder] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isEditingCategories, setIsEditingCategories] = useState(false);
  const [categoryEditResource, setCategoryEditResource] =
    useState<Resource | null>(null);
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [editNameValue, setEditNameValue] = useState('');
  const committedRef = useRef(false);

  const currentFolder = useMemo(() => {
    if (!currentFolderId) return null;
    return (
      (allResources.find((r) => r.id === currentFolderId) as
        FolderResource | undefined) || null
    );
  }, [allResources, currentFolderId]);

  const rawChildren = useMemo(() => {
    if (!currentFolder) return [];
    let children = getFolderChildren(allResources, currentFolder.id);
    if (filterPredicate) {
      children = children.filter(filterPredicate);
    }
    return children;
  }, [currentFolder, allResources, filterPredicate]);

  const [localOrderedChildren, setLocalOrderedChildren] =
    useState<Resource[]>(rawChildren);
  const localOrderedRef = useRef<Resource[]>(rawChildren);

  const [prevRawChildren, setPrevRawChildren] = useState(rawChildren);
  if (rawChildren !== prevRawChildren) {
    setPrevRawChildren(rawChildren);
    setLocalOrderedChildren(rawChildren);
  }

  useEffect(() => {
    localOrderedRef.current = localOrderedChildren;
  }, [localOrderedChildren]);

  const {
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
  } = useFolderModalDrag({
    isReadOnly,
    allResources,
    currentFolderId: currentFolderId || '',
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
  });

  const prevFolderPropIdRef = useRef<string | undefined>(folder?.id);
  useEffect(() => {
    if (folder?.id && folder.id !== prevFolderPropIdRef.current) {
      prevFolderPropIdRef.current = folder.id;
      setCurrentFolderId(folder.id);
      setIsEditingCategories(false);
      setIsEditingFolder(false);
      resetDragStates();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folder?.id]);

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

  const breadcrumbs = getFolderBreadcrumbs(currentFolder, allResources);

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
          <FolderModalHeader
            currentFolder={currentFolder}
            breadcrumbs={breadcrumbs}
            editingNameId={editingNameId}
            editNameValue={editNameValue}
            setEditNameValue={setEditNameValue}
            setEditingNameId={setEditingNameId}
            committedRef={committedRef}
            onRenameResource={onRenameResource}
            onClose={onClose}
            onNavigateFolder={(id) => setCurrentFolderId(id)}
            isReadOnly={isReadOnly}
          />

          <FolderModalToolbar
            isReadOnly={isReadOnly}
            currentFolder={currentFolder}
            isEditingFolder={isEditingFolder}
            setIsEditingFolder={setIsEditingFolder}
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
            isEditingCategories={isEditingCategories}
            setIsEditingCategories={setIsEditingCategories}
            isCreatingFolder={isCreatingFolder}
            setIsCreatingFolder={setIsCreatingFolder}
            newFolderName={newFolderName}
            setNewFolderName={setNewFolderName}
            onAddResourceToFolder={onAddResourceToFolder}
            onDeleteResources={onDeleteResources}
            onCategoriesChange={onCategoriesChange}
            handleCreateFolderSubmit={handleCreateFolderSubmit}
          />

          <div
            ref={contentRef}
            className="p-4 sm:p-6 overflow-y-auto flex-1 bg-white"
          >
            {localOrderedChildren.length === 0 ? (
              <div className="text-center py-12 text-neutral-500 text-sm">
                <FolderOpenIcon
                  sx={{ fontSize: 48 }}
                  className="mx-auto opacity-30 mb-2 pointer-events-none text-neutral-400"
                />
                <p>This folder is empty.</p>
                <p className="text-xs text-neutral-400 mt-1">
                  Add files or create subfolders using the actions above.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(88px,1fr))] gap-3 sm:gap-4 pt-2 pb-2 px-1 items-start">
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
                        canReorder={!isReadOnly && selectedIds.size === 0}
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
                          if (isReadOnly || justFinishedSweepRef.current)
                            return;
                          setSelectedIds((prev) => {
                            const next = new Set(prev);
                            if (next.has(id)) next.delete(id);
                            else next.add(id);
                            return next;
                          });
                        }}
                        onRoundButtonPointerDown={(e) => {
                          if (!isReadOnly)
                            handleSweepPointerDown(
                              e.clientX,
                              e.clientY,
                              item.id,
                            );
                        }}
                        onRoundButtonClick={(id) => {
                          if (isReadOnly || justFinishedSweepRef.current)
                            return;
                          setSelectedIds((prev) => {
                            const next = new Set(prev);
                            if (next.has(id)) next.delete(id);
                            else next.add(id);
                            return next;
                          });
                        }}
                        onCardPointerDown={(e) => {
                          if (!isReadOnly) {
                            handleCardPointerDown(e, item.id);
                            startPointerDrag(e, item.id);
                          }
                        }}
                        onClick={(resource) => {
                          if (justDraggedRef.current) return;
                          if (resource.type === 'folder') {
                            setCurrentFolderId(resource.id);
                          } else if (resource.type === 'link') {
                            if (resource.URL) {
                              window.open(
                                resource.URL,
                                '_blank',
                                'noopener,noreferrer',
                              );
                            }
                          } else if (resource.type === 'file') {
                            const url =
                              (resource as FileResource).fileUrl || '#';
                            window.open(url, '_blank', 'noopener,noreferrer');
                          } else {
                            onSelectResourceDetail(resource);
                          }
                        }}
                        onRename={isReadOnly ? undefined : onRenameResource}
                        onEditCategories={
                          isReadOnly
                            ? undefined
                            : (res) => setCategoryEditResource(res)
                        }
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <FolderDragGhost
        ghostRef={ghostRef}
        pointerDragIds={pointerDragIds}
        allResources={allResources}
        isDraggingOutside={isDraggingOutside}
        pointerDropTarget={pointerDropTarget}
      />

      {categoryEditResource && (
        <EditCategoriesModal
          resource={categoryEditResource}
          onClose={() => setCategoryEditResource(null)}
          onSave={(id, cats) => {
            onCategoriesChange?.(id, cats);
            setCategoryEditResource(null);
          }}
        />
      )}
    </>
  );
}

export default FolderDirectoryModal;
