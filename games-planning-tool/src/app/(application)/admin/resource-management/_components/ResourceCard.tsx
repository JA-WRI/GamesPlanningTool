// Made with AI agents (Antigravity)
'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import LinkIcon from '@mui/icons-material/Link';
import { Resource, LinkResource, FileResource } from '@/types/resource';
import { FolderCardView } from './FolderCardView';

export function getFileTypeIcon(resource: Resource): string {
  if (resource.type === 'link' || resource.type === 'folder') return '';

  const fileRes = resource as FileResource;
  const fileName = fileRes.file?.name || resource.name || '';
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  const mime = (fileRes.file?.type || '').toLowerCase();

  // Spreadsheets
  if (
    ['xlsx', 'xls', 'csv', 'tsv', 'ods', 'numbers'].includes(ext) ||
    mime.includes('spreadsheet') ||
    mime.includes('excel') ||
    mime.includes('csv')
  ) {
    return '/icons/file-spreadsheet.svg';
  }

  // Word documents
  if (
    ['doc', 'docx', 'odt', 'pages', 'rtf'].includes(ext) ||
    mime.includes('word') ||
    mime.includes('document')
  ) {
    return '/icons/file-document.svg';
  }

  // Presentations / Slides
  if (
    ['ppt', 'pptx', 'odp', 'key', 'presentation'].includes(ext) ||
    mime.includes('presentation') ||
    mime.includes('powerpoint')
  ) {
    return '/icons/file-presentation.svg';
  }

  // PDF
  if (ext === 'pdf' || mime.includes('pdf')) {
    return '/icons/file-pdf.svg';
  }

  // Plain Text / Markdown
  if (['txt', 'log', 'md', 'markdown'].includes(ext) || mime === 'text/plain') {
    return '/icons/file-text.svg';
  }

  // Code files
  if (
    [
      'js',
      'ts',
      'tsx',
      'jsx',
      'py',
      'json',
      'html',
      'css',
      'scss',
      'yaml',
      'yml',
      'xml',
      'sh',
      'bash',
      'sql',
      'java',
      'c',
      'cpp',
      'cs',
      'go',
      'rs',
      'php',
      'rb',
    ].includes(ext) ||
    mime.includes('json') ||
    mime.includes('javascript') ||
    mime.includes('code')
  ) {
    return '/icons/file-code.svg';
  }

  // Images
  if (
    ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'ico', 'tiff'].includes(
      ext,
    ) ||
    mime.startsWith('image/')
  ) {
    return '/icons/file-image.svg';
  }

  // Default fallback
  return '/icons/file-default.svg';
}

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
  onEditCategories?: (resource: Resource) => void;
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
  onEditCategories,
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

  // Favicon calculation for links
  const [faviconError, setFaviconError] = useState(false);
  let faviconUrl = '';
  if (isLink) {
    const linkRes = resource as LinkResource;
    let url = linkRes.URL || '';
    if (url && !url.startsWith('http')) {
      url = 'https://' + url;
    }
    if (url) {
      try {
        faviconUrl = `https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(url)}&sz=128`;
      } catch {
        faviconUrl = '';
      }
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

  const handleNameClick = (e: React.MouseEvent) => {
    if (onRename && !isEditing) {
      e.stopPropagation();
      e.preventDefault();
      setRenameValue(resource.name);
      setIsRenaming(true);
    }
  };

  const handleNameDoubleClick = (e: React.MouseEvent) => {
    if (onRename && !isEditing) {
      e.stopPropagation();
      e.preventDefault();
      setRenameValue(resource.name);
      setIsRenaming(true);
    }
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (e.key === 'Enter') {
      e.preventDefault();
      commitRename();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setRenameValue(resource.name);
      setIsRenaming(false);
    }
  };

  return (
    <div
      data-resource-id={resource.id}
      data-resource-type={resource.type}
      role="button"
      tabIndex={0}
      aria-label={resource.name}
      onKeyDown={(e) => {
        if (isRenaming || e.target !== e.currentTarget) return;
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
      className={`group relative flex flex-col items-center select-none w-full transition-all duration-150 ${
        isDraggingThisCard ? 'opacity-40 scale-95' : 'hover:-translate-y-0.5'
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
      {/* Square Icon Container */}
      <div
        className={`relative w-full aspect-square flex items-center justify-center p-2 rounded-2xl transition-all duration-150 ${
          isFolderDropTarget
            ? 'ring-4 ring-amber-400 bg-amber-100/70 scale-105 shadow-md z-20'
            : isSelected
              ? 'bg-burgundy/10 ring-2 ring-burgundy'
              : 'bg-transparent hover:bg-black/[0.04]'
        }`}
      >
        {showRemovalSymbol ? (
          <div
            data-testid="drag-removal-symbol"
            className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-red-600 to-red-800 text-white rounded-2xl p-2 z-30 select-none animate-pulse"
          >
            <DeleteIcon
              sx={{ fontSize: 32 }}
              className="text-white drop-shadow-sm"
            />
            <span className="mt-1 text-center text-[10px] font-bold uppercase tracking-wider text-red-100">
              Remove
            </span>
          </div>
        ) : isFolder ? (
          <FolderCardView resource={resource} itemCount={itemCount} />
        ) : isLink ? (
          faviconUrl && !faviconError ? (
            /* eslint-disable-next-line @next/next/no-img-element -- Dynamic external favicon with fallback handler */
            <img
              src={faviconUrl}
              alt=""
              draggable={false}
              className="w-11 h-11 sm:w-12 sm:h-12 object-contain pointer-events-none select-none drop-shadow-2xs"
              onError={() => setFaviconError(true)}
            />
          ) : (
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-blue-50 border border-blue-200/60 flex items-center justify-center text-blue-600 shadow-2xs">
              <LinkIcon sx={{ fontSize: 24 }} />
            </div>
          )
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element -- Dynamic file type icon with error fallback */
          <img
            src={getFileTypeIcon(resource)}
            alt=""
            draggable={false}
            className="w-11 h-13 sm:w-12 sm:h-14 object-contain pointer-events-none select-none drop-shadow-2xs"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        )}

        {/* Selection checkmark button (Edit mode) */}
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
            className="absolute top-1.5 right-1.5 z-30 p-0.5 cursor-pointer focus:outline-hidden"
            aria-label={isSelected ? 'Deselect resource' : 'Select resource'}
          >
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-150 ${
                isSelected
                  ? 'bg-white text-burgundy shadow-sm ring-1 ring-neutral-300 scale-105'
                  : 'border-2 border-neutral-400 bg-white/90 hover:bg-white hover:border-neutral-600'
              }`}
            >
              {isSelected && (
                <CheckIcon
                  sx={{ fontSize: 14 }}
                  className="text-burgundy pointer-events-none"
                />
              )}
            </div>
          </button>
        )}

        {/* Drag grip (Edit mode + Reordering) */}
        {isEditing && canReorder && (
          <div className="absolute bottom-1 right-1 z-20 opacity-40 group-hover:opacity-90 transition-opacity pointer-events-none flex items-center justify-center">
            <DragIndicatorIcon
              sx={{ fontSize: 14 }}
              className="opacity-60 text-neutral-600 pointer-events-none"
            />
          </div>
        )}
      </div>

      {/* Resource Name Label in small text below icon */}
      <div className="mt-1 w-full text-center px-0.5 pointer-events-auto">
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
            className="w-full text-center text-[11px] font-semibold text-neutral-900 bg-white border border-burgundy rounded px-1 py-0.5 outline-none shadow-xs focus:ring-1 focus:ring-burgundy"
          />
        ) : onRename && !isEditing ? (
          <button
            type="button"
            onClick={handleNameClick}
            onDoubleClick={handleNameDoubleClick}
            aria-label={`Rename ${resource.name}`}
            title={`Click to rename "${resource.name}"`}
            className={`w-full text-center bg-transparent border-0 p-0 text-[11px] sm:text-xs font-semibold text-neutral-800 leading-tight line-clamp-2 break-words transition-colors cursor-pointer hover:text-burgundy hover:underline decoration-neutral-300 underline-offset-2 ${
              isSelected ? 'text-burgundy' : ''
            }`}
          >
            {resource.name}
          </button>
        ) : (
          <span
            title={resource.name}
            className={`text-[11px] sm:text-xs font-semibold text-neutral-800 leading-tight line-clamp-2 break-words transition-colors cursor-default group-hover:text-neutral-950 ${
              isSelected ? 'text-burgundy' : ''
            }`}
          >
            {resource.name}
          </span>
        )}
      </div>

      {/* Categories button below resource name */}
      {onEditCategories && !isEditing && (
        <div className="mt-1 flex justify-center w-full pointer-events-auto">
          <button
            type="button"
            data-testid={`categories-btn-${resource.id}`}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onEditCategories(resource);
            }}
            className="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus:opacity-100 transition-all duration-150 inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-semibold rounded-full bg-slate-900/95 text-white border border-slate-600/70 shadow-xs hover:bg-slate-800 hover:border-slate-500 hover:scale-105 active:scale-95 whitespace-nowrap cursor-pointer pointer-events-auto"
            title="Edit categories"
            aria-label="Edit categories"
          >
            <LocalOfferOutlinedIcon
              sx={{ fontSize: 11 }}
              className="text-slate-300"
              aria-hidden="true"
            />
            <span>Categories</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default ResourceCard;
