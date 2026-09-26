import { Resource, DEFAULT_CATEGORY } from '@/types/resource';

export const INITIAL_RESOURCES: Resource[] = [
  {
    id: 'res-w-1',
    name: 'Milano Cortina 2026 Manual',
    type: 'link',
    URL: 'https://olympics.com/en/olympic-games/milano-cortina-2026',
    categories: ['Winter Games'],
    previewUrl:
      'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=600&q=80',
    order: 1,
    createdAt: '2026-09-01T10:00:00Z',
  },
  {
    id: 'res-w-2',
    name: 'Winter Logistics Policy',
    type: 'file',
    categories: ['Winter Games'],
    previewUrl:
      'https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?auto=format&fit=crop&w=600&q=80',
    file: {
      name: 'Winter_Team_Travel_Logistics_2026.pdf',
      size: 2450000,
      type: 'application/pdf',
    },
    fileUrl: '#',
    order: 2,
    createdAt: '2026-09-02T11:30:00Z',
  },
  {
    id: 'res-w-3',
    name: 'Alpine Equipment Manifest',
    type: 'file',
    categories: ['Winter Games', 'Alpine Canada'],
    previewUrl:
      'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80',
    file: {
      name: 'Alpine_Canada_Freight_Manifest_V3.xlsx',
      size: 890000,
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    },
    fileUrl: '#',
    order: 3,
    createdAt: '2026-09-05T14:15:00Z',
  },
  {
    id: 'res-w-4',
    name: 'Snowboard Prep Protocols',
    type: 'link',
    URL: 'https://canadasnowboard.ca/en/team/protocols',
    categories: ['Winter Games', 'Canada Snowboard'],
    previewUrl:
      'https://images.unsplash.com/photo-1522056615691-da7b8106829f?auto=format&fit=crop&w=600&q=80',
    order: 4,
    createdAt: '2026-09-08T09:00:00Z',
  },
  {
    id: 'res-w-5',
    name: 'Ice Hockey Accreditations',
    type: 'file',
    categories: ['Winter Games', 'Hockey Canada'],
    previewUrl:
      'https://images.unsplash.com/photo-1580748141549-71748dbe0bdc?auto=format&fit=crop&w=600&q=80',
    file: {
      name: 'Hockey_Canada_Olympic_Roster_Accreditation.pdf',
      size: 1420000,
      type: 'application/pdf',
    },
    fileUrl: '#',
    order: 5,
    createdAt: '2026-09-10T16:45:00Z',
  },
  {
    id: 'res-w-6',
    name: 'Speed Skating Oval Schedule',
    type: 'file',
    categories: ['Winter Games', 'Speed Skating Canada'],
    previewUrl:
      'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=600&q=80',
    file: {
      name: 'Oval_Training_Slots_Milano.xlsx',
      size: 512000,
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    },
    fileUrl: '#',
    order: 6,
    createdAt: '2026-09-11T12:00:00Z',
  },
  {
    id: 'res-w-7',
    name: 'Curling Equipment Guidelines',
    type: 'link',
    URL: 'https://curling.ca/high-performance/olympics',
    categories: ['Winter Games', 'Curling Canada'],
    previewUrl:
      'https://images.unsplash.com/photo-1547941126-3d5322b218b0?auto=format&fit=crop&w=600&q=80',
    order: 7,
    createdAt: '2026-09-12T13:20:00Z',
  },
  {
    id: 'res-w-8',
    name: 'Winter Medical Protocols',
    type: 'file',
    categories: ['Winter Games'],
    previewUrl:
      'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=600&q=80',
    file: {
      name: 'COC_Winter_Games_Medical_Emergency.pdf',
      size: 3100000,
      type: 'application/pdf',
    },
    fileUrl: '#',
    order: 8,
    createdAt: '2026-09-13T08:00:00Z',
  },

  {
    id: 'res-s-1',
    name: 'LA 2028 Village Guide',
    type: 'link',
    URL: 'https://la28.org/en/games-plan',
    categories: ['Summer Games'],
    previewUrl:
      'https://images.unsplash.com/photo-1580655653885-65763b2597d0?auto=format&fit=crop&w=600&q=80',
    order: 1,
    createdAt: '2026-09-01T10:00:00Z',
  },
  {
    id: 'res-s-2',
    name: 'Summer Accreditation Matrix',
    type: 'file',
    categories: ['Summer Games'],
    previewUrl:
      'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=600&q=80',
    file: {
      name: 'LA28_Accreditation_Matrix_Draft.xlsx',
      size: 1100000,
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    },
    fileUrl: '#',
    order: 2,
    createdAt: '2026-09-03T11:00:00Z',
  },
  {
    id: 'res-s-3',
    name: 'Athletics Trials Schedule',
    type: 'link',
    URL: 'https://athletics.ca/national-championships-trials',
    categories: ['Summer Games', 'Athletics Canada'],
    previewUrl:
      'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=600&q=80',
    order: 3,
    createdAt: '2026-09-06T15:00:00Z',
  },
  {
    id: 'res-s-4',
    name: 'Aquatics Training Center Plan',
    type: 'file',
    categories: ['Summer Games', 'Swimming Canada'],
    previewUrl:
      'https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=600&q=80',
    file: {
      name: 'Swimming_Canada_Staging_Camp.pdf',
      size: 2150000,
      type: 'application/pdf',
    },
    fileUrl: '#',
    order: 4,
    createdAt: '2026-09-07T14:30:00Z',
  },
  {
    id: 'res-s-5',
    name: 'Rowing Shell Transit Plan',
    type: 'file',
    categories: ['Summer Games', 'Rowing Canada'],
    previewUrl:
      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80',
    file: {
      name: 'Rowing_Canada_Boat_Shipping_Container.pdf',
      size: 3400000,
      type: 'application/pdf',
    },
    fileUrl: '#',
    order: 5,
    createdAt: '2026-09-09T09:20:00Z',
  },
  {
    id: 'res-s-6',
    name: 'Cycling Team Roadmap',
    type: 'link',
    URL: 'https://cyclingcanada.ca/olympic-pathway',
    categories: ['Summer Games', 'Cycling Canada'],
    previewUrl:
      'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=600&q=80',
    order: 6,
    createdAt: '2026-09-10T10:15:00Z',
  },
  {
    id: 'res-s-7',
    name: 'Rugby Sevens Staging Handbook',
    type: 'file',
    categories: ['Summer Games', 'Rugby Canada'],
    previewUrl:
      'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=600&q=80',
    file: {
      name: 'Rugby7s_Staging_Manual_2028.pdf',
      size: 1800000,
      type: 'application/pdf',
    },
    fileUrl: '#',
    order: 7,
    createdAt: '2026-09-12T11:00:00Z',
  },
  {
    id: 'res-s-8',
    name: 'Gymnastics Podium Training Slots',
    type: 'link',
    URL: 'https://gymcan.org/olympic-staging',
    categories: ['Summer Games', 'Gymnastics Canada'],
    previewUrl:
      'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=600&q=80',
    order: 8,
    createdAt: '2026-09-14T09:40:00Z',
  },

  {
    id: 'res-g-1',
    name: 'COC Brand Identity Guide',
    type: 'file',
    categories: ['General'],
    previewUrl:
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80',
    file: {
      name: 'Canadian_Olympic_Committee_Brand_Identity_Guidelines.pdf',
      size: 4200000,
      type: 'application/pdf',
    },
    fileUrl: '#',
    order: 1,
    createdAt: '2026-09-01T08:00:00Z',
  },
  {
    id: 'res-g-2',
    name: 'Athlete Code of Conduct',
    type: 'file',
    categories: ['General'],
    previewUrl:
      'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600&q=80',
    file: {
      name: 'Team_Canada_Code_Of_Conduct_2026.pdf',
      size: 950000,
      type: 'application/pdf',
    },
    fileUrl: '#',
    order: 2,
    createdAt: '2026-09-02T10:00:00Z',
  },
  {
    id: 'res-g-3',
    name: 'Planning Master Timeline',
    type: 'file',
    categories: ['General'],
    previewUrl:
      'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=600&q=80',
    file: {
      name: 'COC_Quadrennial_Master_Timeline.xlsx',
      size: 1600000,
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    },
    fileUrl: '#',
    order: 3,
    createdAt: '2026-09-03T12:00:00Z',
  },
  {
    id: 'res-g-4',
    name: 'SIM & Communications Guide',
    type: 'link',
    URL: 'https://olympic.ca/operations/communications-roaming',
    categories: ['General'],
    previewUrl:
      'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&w=600&q=80',
    order: 4,
    createdAt: '2026-09-04T15:30:00Z',
  },
  {
    id: 'res-g-5',
    name: 'Safe Sport & Safeguarding',
    type: 'file',
    categories: ['General'],
    previewUrl:
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80',
    file: {
      name: 'Safe_Sport_Policy_Framework_COC.pdf',
      size: 2100000,
      type: 'application/pdf',
    },
    fileUrl: '#',
    order: 5,
    createdAt: '2026-09-05T09:10:00Z',
  },
  {
    id: 'res-g-6',
    name: 'Per Diem Expense Policy',
    type: 'link',
    URL: 'https://olympic.ca/operations/finance/per-diem',
    categories: ['General'],
    previewUrl:
      'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
    order: 6,
    createdAt: '2026-09-06T14:40:00Z',
  },
];

export function normalizeResourceCategories(categories: string[]): string[] {
  const filtered = categories.filter((c) => c && c.trim().length > 0);
  if (filtered.length === 0) {
    return [DEFAULT_CATEGORY];
  }
  return filtered;
}

const STORAGE_KEY = 'gpt_resources_state_v1';

let cachedResources: Resource[] = INITIAL_RESOURCES;
let hasLoadedFromStorage = false;

export function loadResourcesFromStorage(): Resource[] {
  if (typeof window === 'undefined') return INITIAL_RESOURCES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_RESOURCES;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_RESOURCES;
  } catch {
    return INITIAL_RESOURCES;
  }
}

export function getCachedResources(): Resource[] {
  if (typeof window === 'undefined') return INITIAL_RESOURCES;
  if (!hasLoadedFromStorage) {
    cachedResources = loadResourcesFromStorage();
    hasLoadedFromStorage = true;
  }
  return cachedResources;
}

export function subscribeToResources(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = () => {
    cachedResources = loadResourcesFromStorage();
    callback();
  };
  window.addEventListener('storage', handler);
  window.addEventListener('gpt-resources-change', handler);
  return () => {
    window.removeEventListener('storage', handler);
    window.removeEventListener('gpt-resources-change', handler);
  };
}

export function saveResourcesToStorage(resources: Resource[]): void {
  if (typeof window === 'undefined') return;
  try {
    cachedResources = resources;
    hasLoadedFromStorage = true;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resources));
    window.dispatchEvent(new Event('gpt-resources-change'));
  } catch (e) {
    console.error('Failed to save resources to localStorage', e);
  }
}
