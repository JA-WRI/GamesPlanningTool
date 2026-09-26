export interface BaseResource {
  id: string;
  name: string;
  categories: string[];
  previewUrl?: string;
  createdAt?: string;
  order?: number;
}

export interface LinkResource extends BaseResource {
  type: 'link';
  URL: string;
}

export interface FileResource extends BaseResource {
  type: 'file';
  file?: {
    name: string;
    size: number;
    type: string;
    lastModified?: number;
  };
  fileUrl?: string;
}

export type Resource = LinkResource | FileResource;

export const DEFAULT_CATEGORY = 'General';

export const PRIMARY_CATEGORIES = [
  'Winter Games',
  'Summer Games',
  'General',
] as const;

export const CANADIAN_NSOS = [
  'Alpine Canada',
  'Athletics Canada',
  'Canada Basketball',
  'Canada Snowboard',
  'Canada Soccer',
  'Canoe Kayak Canada',
  'Curling Canada',
  'Cycling Canada',
  'Field Hockey Canada',
  'Figure Skating (Skate Canada)',
  'Gymnastics Canada',
  'Hockey Canada',
  'Judo Canada',
  'Rowing Canada',
  'Rugby Canada',
  'Speed Skating Canada',
  'Swimming Canada',
  'Tennis Canada',
  'Triathlon Canada',
  'Volleyball Canada',
  'Water Polo Canada',
  'Wrestling Canada',
] as const;

export type NsoCategory = (typeof CANADIAN_NSOS)[number];
