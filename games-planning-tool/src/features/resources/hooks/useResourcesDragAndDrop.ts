// Made with AI agents (Antigravity)
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Resource, FolderResource } from '@/features/resources/types/resource';

interface UseResourcesDragAndDropProps {
  filteredResources: Resource[];
  allResources: Resource[];
  isReadOnly: boolean;
  selectedIds: Set<string>;
  updateResources: (newResources: Resource[]) => void;
  showToast: (msg: string) => void;
  setActiveDirectoryFolder: (folder: FolderResource | null) => void;
  setIsEditing: (isEditing: boolean) => void;
}

export function useResourcesDragAndDrop({
  filteredResources,
  allResources,
  isReadOnly,
  selectedIds,
  updateResources,
  showToast,
  setActiveDirectoryFolder,
  setIsEditing,
}: UseResourcesDragAndDropProps) {
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

  const handleDragStart = (e: React.DragEvent, id: string) => {
    if (isReadOnly || selectedIds.size > 0) {
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
    if (isReadOnly) return;
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
    if (isReadOnly) return;
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
      const updated = allResources.map((r) =>
        r.id === itemToMove ? { ...r, parentId: folderDropTarget } : r,
      );
      updateResources(updated);
      showToast('Moved item into folder');
    } else if (itemToMove && selectedIds.size === 0) {
      const reorderedIds = new Set(localOrderedRef.current.map((r) => r.id));
      const otherResources = allResources.filter(
        (r) => !reorderedIds.has(r.id),
      );
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
        .map((id) => allResources.find((r) => r.id === id))
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

  return {
    localOrderedResources,
    setLocalOrderedResources,
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
  };
}
