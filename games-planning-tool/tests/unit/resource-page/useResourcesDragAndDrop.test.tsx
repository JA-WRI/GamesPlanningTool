// Made with AI agents (Antigravity)
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { useResourcesDragAndDrop } from '@/app/features/resources/hooks/useResourcesDragAndDrop';
import { Resource, FolderResource } from '@/types/resource';

describe('useResourcesDragAndDrop', () => {
  const item1: Resource = {
    id: 'res-1',
    name: 'Item 1',
    type: 'file',
    fileUrl: 'url-1',
    categories: [],
  };
  const item2: Resource = {
    id: 'res-2',
    name: 'Item 2',
    type: 'file',
    fileUrl: 'url-2',
    categories: [],
  };
  const folder1: FolderResource = {
    id: 'folder-1',
    name: 'Folder 1',
    type: 'folder',
    categories: [],
  };

  let defaultProps: Parameters<typeof useResourcesDragAndDrop>[0];

  beforeEach(() => {
    document.elementFromPoint = vi.fn();
    defaultProps = {
      filteredResources: [item1, item2, folder1],
      allResources: [item1, item2, folder1],
      isReadOnly: false,
      selectedIds: new Set(),
      updateResources: vi.fn(),
      showToast: vi.fn(),
      setActiveDirectoryFolder: vi.fn(),
      setIsEditing: vi.fn(),
    };
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('initializes and updates with filteredResources when not dragging', () => {
    const { result, rerender } = renderHook(
      (props) => useResourcesDragAndDrop(props),
      { initialProps: defaultProps },
    );

    expect(result.current.localOrderedResources).toEqual([
      item1,
      item2,
      folder1,
    ]);

    const updatedList = [item2, item1];
    rerender({
      ...defaultProps,
      filteredResources: updatedList,
    });

    expect(result.current.localOrderedResources).toEqual(updatedList);
  });

  describe('handleDragStart', () => {
    it('prevents drag if isReadOnly is true', () => {
      const { result } = renderHook(() =>
        useResourcesDragAndDrop({ ...defaultProps, isReadOnly: true }),
      );

      const mockEvent = {
        preventDefault: vi.fn(),
        dataTransfer: { effectAllowed: '', setData: vi.fn() },
      } as unknown as React.DragEvent;

      act(() => {
        result.current.handleDragStart(mockEvent, 'res-1');
      });

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(result.current.draggedCardId).toBeNull();
    });

    it('prevents drag if selectedIds is not empty', () => {
      const { result } = renderHook(() =>
        useResourcesDragAndDrop({
          ...defaultProps,
          selectedIds: new Set(['res-1']),
        }),
      );

      const mockEvent = {
        preventDefault: vi.fn(),
        dataTransfer: { effectAllowed: '', setData: vi.fn() },
      } as unknown as React.DragEvent;

      act(() => {
        result.current.handleDragStart(mockEvent, 'res-1');
      });

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(result.current.draggedCardId).toBeNull();
    });

    it('starts drag successfully and sets dataTransfer', () => {
      const { result } = renderHook(() =>
        useResourcesDragAndDrop(defaultProps),
      );

      const setData = vi.fn();
      const mockEvent = {
        preventDefault: vi.fn(),
        dataTransfer: { effectAllowed: '', setData },
      } as unknown as React.DragEvent;

      act(() => {
        result.current.handleDragStart(mockEvent, 'res-1');
      });

      expect(result.current.draggedCardId).toBe('res-1');
      expect(defaultProps.setIsEditing).toHaveBeenCalledWith(true);
      expect(mockEvent.dataTransfer.effectAllowed).toBe('move');
      expect(setData).toHaveBeenCalledWith('text/plain', 'res-1');
    });
  });

  describe('handleDragOver and spring loading', () => {
    it('does nothing if isReadOnly is true or source matches target', () => {
      const { result } = renderHook(() =>
        useResourcesDragAndDrop({ ...defaultProps, isReadOnly: true }),
      );

      const mockEvent = {
        preventDefault: vi.fn(),
        dataTransfer: {},
      } as unknown as React.DragEvent;

      act(() => {
        result.current.handleDragOver(mockEvent, 'res-1');
      });
      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    });

    it('triggers folder hover and spring loading timeout', () => {
      vi.useFakeTimers();
      const { result } = renderHook(() =>
        useResourcesDragAndDrop(defaultProps),
      );

      // Start drag of res-1
      const startEvent = {
        preventDefault: vi.fn(),
        dataTransfer: { effectAllowed: '', setData: vi.fn() },
      } as unknown as React.DragEvent;
      act(() => {
        result.current.handleDragStart(startEvent, 'res-1');
      });

      // Drag over folder-1 with relativeX = 0.5 (within 0.15 to 0.85)
      const overEvent = {
        preventDefault: vi.fn(),
        dataTransfer: {},
        clientX: 150,
        currentTarget: {
          getBoundingClientRect: () => ({
            left: 100,
            width: 100,
            top: 50,
            bottom: 150,
            right: 200,
          }),
        },
      } as unknown as React.DragEvent;

      act(() => {
        result.current.handleDragOver(overEvent, 'folder-1');
      });

      expect(result.current.hoverFolderDropTargetId).toBe('folder-1');

      // Fast-forward 600ms
      act(() => {
        vi.advanceTimersByTime(600);
      });

      expect(defaultProps.setActiveDirectoryFolder).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'folder-1' }),
      );
      expect(result.current.hoverFolderDropTargetId).toBeNull();
      vi.useRealTimers();
    });

    it('reorders cards on drag over when moving forward and clientX >= midX', () => {
      const { result } = renderHook(() =>
        useResourcesDragAndDrop(defaultProps),
      );

      const startEvent = {
        preventDefault: vi.fn(),
        dataTransfer: { effectAllowed: '', setData: vi.fn() },
      } as unknown as React.DragEvent;
      act(() => {
        result.current.handleDragStart(startEvent, 'res-1');
      });

      // Target is res-2. rect midX = 150. clientX = 160 (>= 150)
      const overEvent = {
        preventDefault: vi.fn(),
        dataTransfer: {},
        clientX: 160,
        currentTarget: {
          getBoundingClientRect: () => ({
            left: 100,
            width: 100,
            top: 50,
            bottom: 150,
            right: 200,
          }),
        },
      } as unknown as React.DragEvent;

      act(() => {
        result.current.handleDragOver(overEvent, 'res-2');
      });

      expect(result.current.localOrderedResources[0].id).toBe('res-2');
      expect(result.current.localOrderedResources[1].id).toBe('res-1');
    });
  });

  describe('handleDrop and handleDragEnd', () => {
    it('moves item into folder on drop when target is folder', () => {
      const { result } = renderHook(() =>
        useResourcesDragAndDrop(defaultProps),
      );

      // Start drag of res-1
      act(() => {
        result.current.handleDragStart(
          {
            preventDefault: vi.fn(),
            dataTransfer: { setData: vi.fn() },
          } as unknown as React.DragEvent,
          'res-1',
        );
      });

      // Drop on folder-1
      act(() => {
        result.current.handleDrop(
          { preventDefault: vi.fn() } as unknown as React.DragEvent,
          'folder-1',
        );
      });

      expect(defaultProps.updateResources).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ id: 'res-1', parentId: 'folder-1' }),
        ]),
      );
      expect(defaultProps.showToast).toHaveBeenCalledWith(
        'Moved item into folder',
      );
      expect(result.current.draggedCardId).toBeNull();
    });

    it('saves reordered list on drop if not dropped into folder', () => {
      const { result } = renderHook(() =>
        useResourcesDragAndDrop(defaultProps),
      );

      act(() => {
        result.current.handleDragStart(
          {
            preventDefault: vi.fn(),
            dataTransfer: { setData: vi.fn() },
          } as unknown as React.DragEvent,
          'res-1',
        );
      });

      // Simulate reorder
      const overEvent = {
        preventDefault: vi.fn(),
        dataTransfer: {},
        clientX: 160,
        currentTarget: {
          getBoundingClientRect: () => ({
            left: 100,
            width: 100,
          }),
        },
      } as unknown as React.DragEvent;
      act(() => {
        result.current.handleDragOver(overEvent, 'res-2');
      });

      act(() => {
        result.current.handleDrop({
          preventDefault: vi.fn(),
        } as unknown as React.DragEvent);
      });

      expect(defaultProps.updateResources).toHaveBeenCalled();
      expect(result.current.draggedCardId).toBeNull();
    });

    it('resets order on handleDragEnd if drop was not successful', () => {
      const { result } = renderHook(() =>
        useResourcesDragAndDrop(defaultProps),
      );

      act(() => {
        result.current.handleDragStart(
          {
            preventDefault: vi.fn(),
            dataTransfer: { setData: vi.fn() },
          } as unknown as React.DragEvent,
          'res-1',
        );
      });

      act(() => {
        result.current.handleDragEnd();
      });

      expect(result.current.localOrderedResources).toEqual(
        defaultProps.filteredResources,
      );
      expect(result.current.draggedCardId).toBeNull();
    });
  });

  describe('handlePointerHoverMainPage', () => {
    it('resets localOrderedResources when draggedIds is empty and not dropped', () => {
      const { result } = renderHook(() =>
        useResourcesDragAndDrop(defaultProps),
      );

      act(() => {
        result.current.handlePointerHoverMainPage(100, 100, []);
      });

      expect(result.current.localOrderedResources).toEqual(
        defaultProps.filteredResources,
      );
    });

    it('clears hoverFolderDropTargetId if target element is not found or is in draggedIds', () => {
      const { result } = renderHook(() =>
        useResourcesDragAndDrop(defaultProps),
      );

      vi.mocked(document.elementFromPoint).mockReturnValue(null);

      act(() => {
        result.current.handlePointerHoverMainPage(100, 100, ['res-1']);
      });

      expect(result.current.hoverFolderDropTargetId).toBeNull();
    });

    it('hovers folder and sets spring loading timer on pointer hover', () => {
      vi.useFakeTimers();
      const { result } = renderHook(() =>
        useResourcesDragAndDrop(defaultProps),
      );

      const targetDiv = document.createElement('div');
      targetDiv.setAttribute('data-resource-id', 'folder-1');
      targetDiv.setAttribute('data-resource-type', 'folder');
      targetDiv.getBoundingClientRect = () => ({
        left: 100,
        right: 200,
        top: 50,
        bottom: 150,
        width: 100,
        height: 100,
        x: 100,
        y: 50,
        toJSON: () => {},
      });

      vi.mocked(document.elementFromPoint).mockReturnValue(targetDiv);

      act(() => {
        result.current.handlePointerHoverMainPage(150, 100, ['res-1']);
      });

      expect(result.current.hoverFolderDropTargetId).toBe('folder-1');

      act(() => {
        vi.advanceTimersByTime(600);
      });

      expect(defaultProps.setActiveDirectoryFolder).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'folder-1' }),
      );
      vi.useRealTimers();
    });

    it('reorders items by pointer hover when dragging over a file card', () => {
      const { result } = renderHook(() =>
        useResourcesDragAndDrop(defaultProps),
      );

      const targetDiv = document.createElement('div');
      targetDiv.setAttribute('data-resource-id', 'res-2');
      targetDiv.setAttribute('data-resource-type', 'file');
      targetDiv.getBoundingClientRect = () => ({
        left: 100,
        right: 200,
        top: 50,
        bottom: 150,
        width: 100,
        height: 100,
        x: 100,
        y: 50,
        toJSON: () => {},
      });

      vi.mocked(document.elementFromPoint).mockReturnValue(targetDiv);

      act(() => {
        // clientX = 160 (> midX 150), should insert after res-2
        result.current.handlePointerHoverMainPage(160, 100, ['res-1']);
      });

      expect(result.current.localOrderedResources[0].id).toBe('res-2');
      expect(result.current.localOrderedResources[1].id).toBe('res-1');
    });
  });
});
