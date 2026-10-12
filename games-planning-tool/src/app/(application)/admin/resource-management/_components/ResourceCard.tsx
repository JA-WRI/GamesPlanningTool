// Made with AI agents (Antigravity)
'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Resource } from '@/types/resource';
import { FolderCardView } from './FolderCardView';

interface ResourceCardProps {
  resource: Resource;
  isEditing: boolean;
  isSelected: boolean;
  canReorder: boolean;
  canDrag?: boolean;
  isDraggingThisCard: boolean;
  showRemovalSymbol?: boolean;
  isFolderDropTarget?: boolean;
  itemCount?: number;
  onToggleSelect: (id: string) => void;
  onRoundButtonPointerDown: (e: React.PointerEvent, id: string) => void;
  onRoundButtonClick: (id: string) => void;
  onCardPointerDown: (e: React.PointerEvent, id: string) => void;
  onClick: (resource: Resource) => void;
  onRename?: (id: string, newName: string) => void;
  onDragStart?: (e: React.DragEvent, id: string) => void;
  onDragOver?: (e: React.DragEvent, id: string) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, id: string) => void;
}

export function ResourceCard({
  resource,
  isEditing,
  isSelected,
  canReorder,
  canDrag,
  isDraggingThisCard,
  showRemovalSymbol,
  isFolderDropTarget,
  itemCount,
  onToggleSelect,
  onRoundButtonPointerDown,
  onRoundButtonClick,
  onCardPointerDown,
  onClick,
  onRename,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop,
}: ResourceCardProps) {
  const isLink = resource.type === 'link';
  const isFolder = resource.type === 'folder';
  const hasMovedDuringDrag = useRef(false);
  const [isRoundPointerDown, setIsRoundPointerDown] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(resource.name);
  const renameInputRef = useRef<HTMLInputElement>(null);
  const isCardDraggable = (canDrag ?? canReorder) && !isRoundPointerDown;

  let previewImage = resource.previewUrl || '';
  if (!previewImage) {
    if (isLink) {
      const linkRes = resource as import('@/types/resource').LinkResource;
      let url = linkRes.URL;
      if (!url.startsWith('http')) {
        url = 'https://' + url;
      }
      previewImage = `https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(url)}&sz=128`;
    } else {
      // Create a fallback data URI for files without a screenshot
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="#f3f4f6"/><text x="50%" y="50%" font-family="sans-serif" font-size="24" fill="#9ca3af" text-anchor="middle" dominant-baseline="middle">${resource.name}</text></svg>`;
      previewImage = `data:image/svg+xml;base64,${btoa(svg)}`;
    }
  }

  useEffect(() => {
    if (isRenaming && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [isRenaming]);

  const commitRename = useCallback(() => {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== resource.name) {
      onRename?.(resource.id, trimmed);
    } else {
      setRenameValue(resource.name);
    }
    setIsRenaming(false);
  }, [renameValue, resource.name, resource.id, onRename]);

  const handleClick = (e: React.MouseEvent) => {
    if (hasMovedDuringDrag.current) {
      hasMovedDuringDrag.current = false;
      return;
    }

    if (isEditing) {
      e.preventDefault();
      e.stopPropagation();
      onToggleSelect(resource.id);
    } else {
      onClick(resource);
    }
  };

  const handleDragStartInternal = (e: React.DragEvent) => {
    if (!isCardDraggable) {
      e.preventDefault();
      return;
    }
    hasMovedDuringDrag.current = true;
    onDragStart?.(e, resource.id);
  };

  const handleDragEndInternal = (e: React.DragEvent) => {
    onDragEnd?.(e);
    setTimeout(() => {
      hasMovedDuringDrag.current = false;
    }, 150);
  };

  const handleNameDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!isEditing) {
      setRenameValue(resource.name);
      setIsRenaming(true);
    }
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      commitRename();
    } else if (e.key === 'Escape') {
      setRenameValue(resource.name);
      setIsRenaming(false);
    }
  };

  /* ---------- Inline rename input ---------- */
  const renameInput = (variant: 'folder' | 'resource') => (
    <input
      ref={renameInputRef}
      type="text"
      value={renameValue}
      onChange={(e) => setRenameValue(e.target.value)}
      onBlur={commitRename}
      onKeyDown={handleRenameKeyDown}
      className={`w-[85%] text-center outline-none ${
        variant === 'folder'
          ? 'text-sm sm:text-base font-extrabold bg-transparent text-amber-950 border-b-2 border-amber-900/40'
          : 'text-lg sm:text-xl font-bold bg-transparent text-white tracking-tight leading-snug drop-shadow-md border-b-2 border-white/50'
      }`}
      style={{
        border: 'none',
        borderBottom:
          variant === 'folder'
            ? '2px solid rgba(69,26,3,0.4)'
            : '2px solid rgba(255,255,255,0.5)',
        borderRadius: 0,
        padding: 0,
        background: 'transparent',
      }}
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    />
  );

  return (
    <div
      data-resource-id={resource.id}
      data-resource-type={resource.type}
      role="button"
      tabIndex={0}
      aria-label={resource.name}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick(e as unknown as React.MouseEvent);
        }
      }}
      draggable={isCardDraggable}
      onDragStart={handleDragStartInternal}
      onDragOver={(e) => onDragOver?.(e, resource.id)}
      onDragEnd={handleDragEndInternal}
      onDrop={(e) => onDrop?.(e, resource.id)}
      onPointerDown={(e) => {
        hasMovedDuringDrag.current = false;
        onCardPointerDown(e, resource.id);
      }}
      onClick={handleClick}
      className={`group relative shrink-0 select-none transform ${
        isFolder
          ? 'w-full aspect-[100/106]'
          : 'w-full aspect-square rounded-3xl overflow-hidden shadow-md bg-gradient-to-br from-[#80131d] to-[#4a0a10]'
      } ${isDraggingThisCard ? '' : 'transition-all duration-200'} ${
        isFolderDropTarget
          ? 'ring-4 ring-amber-400 scale-105 shadow-2xl z-20 rounded-3xl'
          : isDraggingThisCard
            ? showRemovalSymbol
              ? 'opacity-95 scale-95 ring-4 ring-red-500 shadow-2xl shadow-red-950/60 rounded-3xl'
              : 'opacity-40 scale-[0.98] ring-2 ring-white/50 border border-dashed border-white/40 shadow-inner rounded-3xl grayscale-[50%]'
            : isSelected
              ? 'ring-4 ring-white ring-offset-2 ring-offset-[#80131d] scale-[0.97] rounded-3xl'
              : 'hover:shadow-xl hover:-translate-y-1'
      } ${
        isEditing
          ? canReorder
            ? 'cursor-grab active:cursor-grabbing'
            : 'cursor-pointer'
          : 'cursor-pointer'
      }`}
      title={
        isFolderDropTarget
          ? `Drop into folder "${resource.name}"`
          : showRemovalSymbol
            ? `Remove "${resource.name}"`
            : resource.name
      }
    >
      {showRemovalSymbol ? (
        <div
          data-testid="drag-removal-symbol"
          className={`flex flex-col items-center justify-center bg-gradient-to-br from-red-600 via-red-700 to-red-900 text-white p-3 z-30 select-none animate-pulse ${
            isFolder ? 'w-full aspect-square rounded-3xl' : 'absolute inset-0'
          }`}
        >
          <img
            src="/icons/trash.svg"
            alt=""
            className="w-14 h-14 sm:w-16 sm:h-16 invert brightness-0 drop-shadow-lg"
          />
          <span className="mt-1 text-center text-[11px] sm:text-xs font-bold uppercase tracking-wider text-red-100 drop-shadow-xs px-2 leading-tight">
            Remove from Category
          </span>
        </div>
      ) : isFolder ? (
        <FolderCardView
          resource={resource}
          isSelected={isSelected}
          isEditing={isEditing}
          canReorder={canReorder}
          itemCount={itemCount}
          isRenaming={isRenaming}
          renameValue={renameValue}
          setRenameValue={setRenameValue}
          commitRename={commitRename}
          handleRenameKeyDown={handleRenameKeyDown}
          handleNameDoubleClick={handleNameDoubleClick}
          renameInputRef={renameInputRef}
          onRoundButtonPointerDown={onRoundButtonPointerDown}
          onRoundButtonClick={onRoundButtonClick}
          setIsRoundPointerDown={setIsRoundPointerDown}
        />
      ) : (
        /* ========== RESOURCE / FILE CARD (unchanged) ========== */
        <>
          <img
            src={previewImage}
            alt=""
            aria-hidden="true"
            draggable={false}
            className={`absolute inset-0 w-full h-full transition-transform duration-500 group-hover:scale-105 pointer-events-none select-none ${isLink ? 'object-contain p-8 bg-white' : 'object-cover object-center'}`}
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />

          <div
            className={`absolute inset-0 transition-opacity duration-200 pointer-events-none ${
              isSelected
                ? 'bg-[#80131d]/90'
                : 'bg-[#80131d]/85 group-hover:bg-[#80131d]/75'
            }`}
          />

          <div className="absolute inset-0 bg-radial from-transparent to-black/30 pointer-events-none" />

          {/* Resource name overlaid on card */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center z-10 pointer-events-auto select-none">
            {isRenaming ? (
              renameInput('resource')
            ) : (
              <span
                onDoubleClick={handleNameDoubleClick}
                title={resource.name}
                className="text-white font-bold text-lg sm:text-xl tracking-tight leading-snug drop-shadow-md line-clamp-3 cursor-default break-words"
              >
                {resource.name}
              </span>
            )}
          </div>

          {isEditing && (
            <button
              type="button"
              onPointerDown={(e) => {
                e.stopPropagation();
                setIsRoundPointerDown(true);
                const onUp = () => {
                  setIsRoundPointerDown(false);
                  window.removeEventListener('pointerup', onUp);
                  window.removeEventListener('pointercancel', onUp);
                };
                window.addEventListener('pointerup', onUp);
                window.addEventListener('pointercancel', onUp);
                onRoundButtonPointerDown(e, resource.id);
              }}
              onClick={(e) => {
                e.stopPropagation();
                onRoundButtonClick(resource.id);
              }}
              className="absolute top-2.5 right-2.5 z-30 p-1 cursor-pointer focus:outline-hidden"
              aria-label={isSelected ? 'Deselect resource' : 'Select resource'}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-150 ${
                  isSelected
                    ? 'bg-white text-[#80131d] shadow-md scale-110'
                    : 'border-2 border-white/90 bg-black/40 hover:bg-black/60'
                }`}
              >
                {isSelected && (
                  <img
                    src="/icons/check.svg?v=3"
                    alt=""
                    className="w-4 h-4 pointer-events-none"
                  />
                )}
              </div>
            </button>
          )}

          {isEditing && canReorder && (
            <div className="absolute bottom-2 right-2 z-20 opacity-60 group-hover:opacity-100 transition-opacity pointer-events-none">
              <img
                src="/icons/grip.svg"
                alt=""
                className="w-4 h-4 text-white/80 pointer-events-none"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
export default ResourceCard;
