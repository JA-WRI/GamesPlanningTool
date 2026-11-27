// 50% or more AI-generated
export interface BaseResource {
  id: string;
  name: string;
  categories: string[];
  previewUrl?: string;
  createdAt?: string;
  order?: number;
  parentId?: string | null;
}

export interface LinkResource extends BaseResource {
  type: 'link';
  URL: string;
}

export interface FileResource extends BaseResource {
  type: 'file';
  file?: {
    name: string;
    size?: number;
    type?: string;
    lastModified?: number;
  };
  fileUrl?: string;
}

export interface FolderResource extends BaseResource {
  type: 'folder';
  parentId?: string | null;
  childrenIds?: string[];
}

export type Resource = LinkResource | FileResource | FolderResource;

export type NewResourceInput =
  | {
      type: 'link';
      name: string;
      url: string;
      categories: string[];
      parentId?: string | null;
    }
  | {
      type: 'file';
      name: string;
      file: File;
      categories: string[];
      parentId?: string | null;
    };

export const DEFAULT_CATEGORY = 'General';

export const MAX_RESOURCE_FILE_SIZE = 1_000_000_000;

export const MAX_RESOURCE_FILE_SIZE_MESSAGE =
  'The file is too large. The maximum size is 1 GB.';

export const PRIMARY_CATEGORIES = [
  'Winter Games',
  'Summer Games',
  'General',
] as const;
