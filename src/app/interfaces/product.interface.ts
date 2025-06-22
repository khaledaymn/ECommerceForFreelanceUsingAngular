import { SortDirection } from './category';

export interface CreateProduct {
  name: string;
  description?: string | null;
  additionalAttributes?: Record<string, string> | string; // JSON string or object
  brand: string;
  model: string;
  status?: string | null;
  categoryId: number;
  quantity: number;
  mainImage?: File | null; // Image only (png, jpg, jpeg, webp, svg)
  additionalMedia?: File[] | null;
}

export interface UpdateProduct {
  id: number;
  name?: string | null;
  description?: string | null;
  additionalAttributes?: Record<string, string> | string;
  brand?: string | null;
  model?: string | null;
  quantity?: number | null; // Optional for updates
  status?: string | null;
  categoryId?: number | null;
  mainImage?: File | null; // Image only
  additionalMedia?: File[] | null; // Images or videos
  mediaToDelete?: string[] | null; // URLs or public IDs of media to delete
}

export enum ProductStatus {
  Rent = 'إيجار', // For short-term renting (e.g., cars, equipment)
  Purchase = 'شراء', // For purchasing only
  RentAndPurchase = 'إيجار وشراء', // For both renting and purchasing
}

export interface Product {
  id: number;
  name: string;
  description: string;
  additionalAttributes?: string | null; // JSON string
  status: string;
  brand: string; // Corrected typo from "brabd" to "brand"
  model: string; // Corrected typo from "modle" to "model"
  mainImageURL?: string | null;
  imagePublicId?: string | null;
  categoryId: number;
  categoryName?: string | null;
  createdAt: string; // ISO date string
  quantity: number;
  productMedia: ProductMedia[]; // Array of image or video media
}

export interface ProductMedia {
  id?: number;
  mediaURL?: string | null; // URL for image or video
  imageThumbnailURL?: string | null; // Thumbnail for images or videos (if applicable)
  mediaPublicId?: string | null;
  mediaType?: 'image' | 'video' | 'pdf' | null; // Added to distinguish media type
}

export enum SortProp {
  Id = 0,
  Name = 1,
  Description = 2,
  brand = 3,
  model = 4,
  quantity = 5,
  firstName = 6,
  lastName = 7,
}

// export interface ProductParams {
//   search?: string | null;
//   description?: string | null;
//   attributesFilter?: Record<string, string> | null;
//   categoryId?: number | null;
//   status?: string | null;
//   sortProp?: SortProp | null;
//   sortDirection?: SortDirection | null;
//   pageIndex: number;
//   pageSize: number;
// }

export interface ProductParams {
  pageIndex: number;
  pageSize: number;
  search?: string;
  status?: string;
  categoryId?: number;
  brand?: string;
  model?: string;
  sortProp?: string;
  sortDirection?: 0 | 1;
}
