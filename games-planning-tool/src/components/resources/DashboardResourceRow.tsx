// Made with AI agents (Antigravity)
'use client';

import React, { useState, useSyncExternalStore } from 'react';
import { Resource, FolderResource, CANADIAN_NSOS } from '@/types/resource';
import {
  subscribeToResources,
  getCachedResources,
  INITIAL_RESOURCES,
  getFolderChildren,
} from '@/lib/resources-data';
import { Games, Nsos } from '@/lib/data';
import { ResourceCard } from './ResourceCard';
import { FolderDirectoryModal } from './FolderDirectoryModal';
import Link from 'next/link';
import { ResourceDetailModal } from './ResourceDetailModal';

export function DashboardResourceRow({
  gameId,
  nsoId,
  viewerRole,
}: {
  gameId: string;
  nsoId?: string;
  viewerRole?: string;
}) {
  const resources = useSyncExternalStore(
    subscribeToResources,
    getCachedResources,
    () => INITIAL_RESOURCES,
  );

  const [activeDirectoryFolder, setActiveDirectoryFolder] =
    useState<FolderResource | null>(null);
  const [detailResource, setDetailResource] = useState<Resource | null>(null);

  const game = Games.find((g) => g.id === gameId);
  const nso = nsoId ? Nsos.find((n) => n.id === nsoId) : undefined;

  const gameName = game?.name || gameId;
  const gameCategory = gameName.toLowerCase().includes('la 2028')
    ? 'Summer Games'
    : 'Winter Games';

  const nsoName = nso?.name || nsoId;
  const nsoCategoryRaw = nsoName
    ? CANADIAN_NSOS.find((c) =>
        c.toLowerCase().includes(nsoName.toLowerCase()),
      ) || nsoName
    : undefined;

  const filterPredicate = (r: Resource) => {
    const lowerCats = r.categories.map((c) => c.toLowerCase());

    // Fuzzy match for General or Global
    if (lowerCats.some((c) => c.includes('general') || c.includes('global')))
      return true;

    // Check game
    const hasGameCat = lowerCats.some(
      (c) => c.includes('summer') || c.includes('winter'),
    );
    if (
      hasGameCat &&
      !lowerCats.some((c) => c.includes(gameCategory.toLowerCase()))
    ) {
      return false; // Wrong game
    }

    // Check NSO (ONLY if nsoId is provided AND viewer is not admin/coc)
    const isAdminOrCoc = viewerRole === 'admin' || viewerRole === 'coc';
    if (nsoCategoryRaw && !isAdminOrCoc) {
      const lowerNSOs = CANADIAN_NSOS.map((n) => n.toLowerCase());
      const hasNsoCat = lowerCats.some((c) =>
        lowerNSOs.some((nso) => c.includes(nso) || nso.includes(c)),
      );

      if (hasNsoCat) {
        const viewerNsoRaw = nsoCategoryRaw.toLowerCase();
        const matchesViewerNso = lowerCats.some(
          (c) => c.includes(viewerNsoRaw) || viewerNsoRaw.includes(c),
        );
        if (!matchesViewerNso) {
          return false; // Wrong NSO
        }
      }
    }

    return true; // Passed all restrictions
  };

  const filteredResources = resources.filter((r) => {
    if (r.parentId) return false; // Only root items
    return filterPredicate(r);
  });

  return (
    <div className="flex flex-col relative w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Resources</h2>
        <Link
          href={
            nsoId
              ? `/${gameId}/${nsoId}/resources`
              : `/admin/resource-management`
          }
          className="px-4 py-1.5 text-sm font-semibold rounded-md shadow-xs transition-colors bg-white text-slate-800 border border-slate-300 hover:bg-slate-50 cursor-pointer"
        >
          Manage Resources
        </Link>
      </div>

      <div className="flex overflow-x-auto items-end gap-4 pb-4 custom-scrollbar w-full">
        {filteredResources.map((r) => (
          <div key={r.id} className="shrink-0" style={{ width: '160px' }}>
            <ResourceCard
              resource={r}
              isEditing={false}
              isSelected={false}
              canReorder={false}
              isDraggingThisCard={false}
              itemCount={
                r.type === 'folder'
                  ? getFolderChildren(resources, r.id).filter(filterPredicate)
                      .length
                  : undefined
              }
              onToggleSelect={() => {}}
              onRoundButtonPointerDown={() => {}}
              onRoundButtonClick={() => {}}
              onCardPointerDown={() => {}}
              onClick={(res) => {
                if (res.type === 'folder') {
                  setActiveDirectoryFolder(res as FolderResource);
                } else {
                  setDetailResource(res);
                }
              }}
            />
          </div>
        ))}
        {filteredResources.length === 0 && (
          <p className="text-neutral-500 text-sm">
            No resources available for this dashboard.
          </p>
        )}
      </div>

      {detailResource && (
        <ResourceDetailModal
          resource={detailResource}
          onClose={() => setDetailResource(null)}
        />
      )}

      {activeDirectoryFolder && (
        <FolderDirectoryModal
          folder={activeDirectoryFolder}
          allResources={resources}
          currentCategory="Global"
          onClose={() => setActiveDirectoryFolder(null)}
          onSelectResourceDetail={setDetailResource}
          onCreateSubfolder={() => {}}
          onAddResourceToFolder={() => {}}
          onMoveResourceToFolder={() => {}}
          onReorderInFolder={() => {}}
          onDropOnMainPage={() => {}}
          isReadOnly={true}
          filterPredicate={filterPredicate}
        />
      )}
    </div>
  );
}
