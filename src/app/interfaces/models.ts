import type { SortDirection } from "./category"

export interface CreateProduct {
  name: string
  description?: string | null
  additionalAttributes?: Record<string, string> | null
  price: number
  status?: string | null
  categoryId: number
  mainImage?: File | null // Image only (png, jpg, jpeg, webp, svg)
  additionalImages?: File[] | null // Images or videos (png, jpg, jpeg, webp, svg, mp4, webm, mov, mkv)
}

export interface UpdateProduct {
  id: number
  name?: string | null
  description?: string | null
  additionalAttributes?: Record<string, string> | null
  price?: number | null
  status?: string | null
  categoryId?: number | null
  mainImage?: File | null // Image only
  additionalImages?: File[] | null // Images or videos
  imagesToDelete?: string[] | null // URLs or public IDs of media to delete
}

export interface Product {
  id: number
  name: string
  description: string
  additionalAttributes?: string | null // JSON string
  price: number
  status: string
  mainImageUrl?: string | null
  imagePublicId?: string | null
  categoryId: number
  categoryName?: string | null
  createdAt: string // ISO date string
  productImages: ProductMedia[] // Array of image or video media
}

export interface ProductMedia {
  id?: number
  url?: string | null // URL for image or video
  thumbnailUrl?: string | null // Thumbnail for images or videos (if applicable)
  publicId?: string | null
  mediaType?: "image" | "video" | null // Added to distinguish media type
}

export enum SortProp {
  Id = "id",
  Name = "name",
  Description = "description",
  Price = "price",
  Status = "status",
  CategoryId = "categoryId",
  CreatedAt = "createdAt",
}

export interface ProductParams {
  search?: string | null
  description?: string | null
  attributesFilter?: Record<string, string> | null
  categoryId?: number | null
  status?: string | null
  sortProp?: SortProp | null
  sortDirection?: SortDirection | null
  pageIndex: number
  pageSize: number
}
