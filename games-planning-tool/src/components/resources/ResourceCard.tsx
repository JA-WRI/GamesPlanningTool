// Made with AI agents (Antigravity)
'use client';

/* eslint-disable @next/next/no-img-element */
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Resource } from '@/types/resource';

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
  const isCardDraggable =
    isEditing && (canDrag ?? canReorder) && !isRoundPointerDown;

  const previewImage =
    resource.previewUrl ||
    (isLink
      ? 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=600&q=80'
      : 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600&q=80');

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
    if (!isEditing || !isCardDraggable) {
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
      style={{ border: 'none', borderBottom: variant === 'folder' ? '2px solid rgba(69,26,3,0.4)' : '2px solid rgba(255,255,255,0.5)', borderRadius: 0, padding: 0, background: 'transparent' }}
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
        if (isEditing) {
          onCardPointerDown(e, resource.id);
        }
      }}
      onClick={handleClick}
      className={`group relative shrink-0 select-none transform ${
        isFolder
          ? 'w-36 sm:w-40 md:w-44'
          : 'w-36 h-36 sm:w-40 sm:h-40 md:w-44 md:h-44 rounded-3xl overflow-hidden shadow-md bg-gradient-to-br from-[#80131d] to-[#4a0a10]'
      } ${isDraggingThisCard ? '' : 'transition-all duration-200'} ${
        isFolderDropTarget
          ? 'ring-4 ring-amber-400 scale-105 shadow-2xl z-20 rounded-3xl'
          : isDraggingThisCard
            ? showRemovalSymbol
              ? 'opacity-95 scale-95 ring-4 ring-red-500 shadow-2xl shadow-red-950/60 rounded-3xl'
              : 'scale-[0.98] ring-4 ring-white/90 shadow-2xl rounded-3xl'
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
            isFolder
              ? 'w-36 h-36 sm:w-40 sm:h-40 md:w-44 md:h-44 rounded-3xl'
              : 'absolute inset-0'
          }`}
        >
          <svg
            className="w-14 h-14 sm:w-16 sm:h-16 text-white drop-shadow-lg"
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
          <span className="mt-1 text-center text-[11px] sm:text-xs font-bold uppercase tracking-wider text-red-100 drop-shadow-xs px-2 leading-tight">
            Remove from Category
          </span>
        </div>
      ) : isFolder ? (
        /* ========== FOLDER CARD ========== */
        <div
          className="relative select-none pointer-events-none filter drop-shadow-md group-hover:drop-shadow-xl transition-all duration-200"
          style={{ aspectRatio: '100 / 106' }}
        >
          {/* Single continuous SVG: tab flows into body */}
          <svg
            viewBox="0 0 100 106"
            className="w-full block"
            preserveAspectRatio="xMidYMax meet"
          >
            <defs>
              <linearGradient
                id="folderBackGrad"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#d97706" />
                <stop offset="100%" stopColor="#b45309" />
              </linearGradient>
              <linearGradient
                id="folderFrontGrad"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#fbc02d" />
                <stop offset="60%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
            </defs>

            {/* Back panel: tab seamlessly connects to body */}
            <path
              d="M 0 6 L 0 4 C 0 1.8, 1.8 0, 4 0 L 26 0 C 29 0, 31 1.8, 33 3.5 L 34.5 4.8 C 36 6, 38 6, 40 6 L 86.4 6 C 93.9 6, 100 12.1, 100 19.6 L 100 92.4 C 100 99.9, 93.9 106, 86.4 106 L 13.6 106 C 6.1 106, 0 99.9, 0 92.4 Z"
              fill="url(#folderBackGrad)"
            />

            {/* Inner documents peeking out (ONLY when itemCount > 0) */}
            {Boolean(itemCount && itemCount > 0) && (
              <g className="transition-opacity duration-300">
                <rect
                  x="18"
                  y="8"
                  width="64"
                  height="20"
                  rx="2.5"
                  transform="rotate(-2 50 18)"
                  fill="#fef08a"
                  stroke="#ca8a04"
                  strokeWidth="0.9"
                />
                <rect
                  x="21"
                  y="9"
                  width="61"
                  height="20"
                  rx="2.5"
                  fill="#ffffff"
                  stroke="#94a3b8"
                  strokeWidth="0.9"
                />
                <line x1="26" y1="14" x2="48" y2="14" stroke="#475569" strokeWidth="1.6" strokeLinecap="round" />
                <line x1="26" y1="19" x2="65" y2="19" stroke="#64748b" strokeWidth="1.3" strokeLinecap="round" />
                <line x1="26" y1="24" x2="58" y2="24" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" />
              </g>
            )}

            {/* Front flap */}
            <rect x="0" y="12" width="100" height="94" rx="13.6" fill="url(#folderFrontGrad)" />
            {/* Highlight rim */}
            <path d="M 13.6 13 L 86.4 13" stroke="#fff" strokeWidth="0.9" strokeOpacity="0.6" />

            {/* Folder name centered on front flap */}
            <foreignObject x="5" y="20" width="90" height="80">
              <div
                xmlns="http://www.w3.org/1999/xhtml"
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  padding: '4px',
                }}
              >
                {isRenaming ? (
                  <input
                    ref={renameInputRef}
                    type="text"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={commitRename}
                    onKeyDown={handleRenameKeyDown}
                    onClick={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                    style={{
                      width: '90%',
                      textAlign: 'center',
                      fontSize: '14px',
                      fontWeight: 800,
                      background: 'transparent',
                      border: 'none',
                      borderBottom: '2px solid rgba(69,26,3,0.4)',
                      borderRadius: 0,
                      padding: '0 2px',
                      outline: 'none',
                      color: '#451a03',
                      letterSpacing: '-0.025em',
                      lineHeight: '1.3',
                      textShadow: '0 0 2px rgba(255,255,255,0.3)',
                      pointerEvents: 'auto',
                    }}
                  />
                ) : (
                  <span
                    onDoubleClick={handleNameDoubleClick}
                    style={{
                      color: '#451a03',
                      fontWeight: 800,
                      fontSize: '14px',
                      lineHeight: '1.3',
                      letterSpacing: '-0.025em',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      cursor: 'default',
                      textShadow: '0 0 2px rgba(255,255,255,0.3)',
                      pointerEvents: 'auto',
                    }}
                  >
                    {resource.name}
                  </span>
                )}
              </div>
            </foreignObject>
          </svg>

          {/* Selection button — HTML positioned outside SVG (identical to resource cards) */}
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
              className="absolute top-2.5 right-2.5 z-30 p-1 cursor-pointer focus:outline-hidden pointer-events-auto"
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
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 011.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
            </button>
          )}

          {/* Drag grip — HTML positioned outside SVG (identical to resource cards) */}
          {isEditing && canReorder && (
            <div className="absolute bottom-2 right-2 z-20 opacity-60 group-hover:opacity-100 transition-opacity pointer-events-none">
              <svg className="w-4 h-4 text-white/80" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7 4a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0zM7 16a2 2 0 11-4 0 2 2 0 014 0zM17 4a2 2 0 11-4 0 2 2 0 014 0zM17 10a2 2 0 11-4 0 2 2 0 014 0zM17 16a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          )}
        </div>
      ) : (
        /* ========== RESOURCE / FILE CARD (unchanged) ========== */
        <>
          <img
            src={previewImage}
            alt=""
            aria-hidden="true"
            draggable={false}
            className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105 pointer-events-none select-none"
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
                className="text-white font-bold text-lg sm:text-xl tracking-tight leading-snug drop-shadow-md line-clamp-3 cursor-default"
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
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 011.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
            </button>
          )}

          {isEditing && canReorder && (
            <div className="absolute bottom-2 right-2 z-20 opacity-60 group-hover:opacity-100 transition-opacity pointer-events-none">
              <svg className="w-4 h-4 text-white/80" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7 4a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0zM7 16a2 2 0 11-4 0 2 2 0 014 0zM17 4a2 2 0 11-4 0 2 2 0 014 0zM17 10a2 2 0 11-4 0 2 2 0 014 0zM17 16a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          )}
        </>
      )}
    </div>
  );
}
export default ResourceCard;
