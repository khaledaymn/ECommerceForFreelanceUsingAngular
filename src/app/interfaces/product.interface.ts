export interface ProductImage {
  id: number
  mediaURL: string
  imageThumbnailURL: string
  mediaPublicId: string
}

export interface Product {
  id: number
  name: string
  description: string
  additionalAttributes: string
  price: number
  status: string
  mainImageURL: string | null
  imagePublicId: string | null
  categoryId: number
  categoryName: string
  brandId: number
  brandName: string
  createdAt: string
  productImages: ProductImage[]
}

export interface PaginationResponse<T> {
  pageSize: number
  pageIndex: number
  totalCount: number
  data: T[]
}

export interface ProductParams {
  search?: string
  description?: string
  attributesFilter?: { [key: string]: string }
  categoryId?: number
  brandId?: number
  status?: string
  sortProp?: string
  sortDirection?: "asc" | "desc"
  pageIndex: number
  pageSize: number
}

export interface ResultDTO {
  isSuccess: boolean
  message: string
}
