'use client';

/* eslint-disable @next/next/no-img-element */
import React, { useRef, useState } from 'react';
import { Resource } from '@/types/resource';

interface ResourceCardProps {
  resource: Resource;
  isEditing: boolean;
  isSelected: boolean;
  canReorder: boolean;
  canDrag?: boolean;
  isDraggingThisCard: boolean;
  showRemovalSymbol?: boolean;
  onToggleSelect: (id: string) => void;
  onRoundButtonPointerDown: (e: React.PointerEvent, id: string) => void;
  onRoundButtonClick: (id: string) => void;
  onCardPointerDown: (e: React.PointerEvent, id: string) => void;
  onClick: (resource: Resource) => void;
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
  onToggleSelect,
  onRoundButtonPointerDown,
  onRoundButtonClick,
  onCardPointerDown,
  onClick,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop,
}: ResourceCardProps) {
  const isLink = resource.type === 'link';
  const hasMovedDuringDrag = useRef(false);
  const [isRoundPointerDown, setIsRoundPointerDown] = useState(false);
  const isCardDraggable =
    isEditing && (canDrag ?? canReorder) && !isRoundPointerDown;

  const previewImage =
    resource.previewUrl ||
    (isLink
      ? 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=600&q=80'
      : 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600&q=80');

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

  return (
    <div
      data-resource-id={resource.id}
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
      className={`group relative shrink-0 w-36 h-36 sm:w-40 sm:h-40 md:w-44 md:h-44 rounded-3xl overflow-hidden shadow-md select-none bg-gradient-to-br from-[#80131d] to-[#4a0a10] transform ${
        isDraggingThisCard ? '' : 'transition-all duration-200'
      } ${
        isDraggingThisCard
          ? showRemovalSymbol
            ? 'opacity-95 scale-95 ring-4 ring-red-500 shadow-2xl shadow-red-950/60'
            : 'scale-[0.98] ring-4 ring-white/90 shadow-2xl'
          : isSelected
            ? 'ring-4 ring-white ring-offset-2 ring-offset-[#80131d] scale-[0.97]'
            : 'hover:shadow-xl hover:-translate-y-1'
      } ${
        isEditing
          ? canReorder
            ? 'cursor-grab active:cursor-grabbing'
            : 'cursor-pointer'
          : 'cursor-pointer'
      }`}
      title={showRemovalSymbol ? `Remove "${resource.name}"` : resource.name}
    >
      {showRemovalSymbol ? (
        <div
          data-testid="drag-removal-symbol"
          className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-red-600 via-red-700 to-red-900 text-white p-3 z-30 select-none animate-pulse"
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
      ) : (
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

          <div className="absolute inset-0 flex items-center justify-center p-3 text-center z-10 pointer-events-none select-none">
            <span className="text-white font-bold text-lg sm:text-xl tracking-tight leading-snug drop-shadow-md line-clamp-3">
              {resource.name}
            </span>
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
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
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
              <svg
                className="w-4 h-4 text-white/80"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
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
