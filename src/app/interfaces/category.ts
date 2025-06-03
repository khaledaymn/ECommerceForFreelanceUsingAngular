export interface Category {
  id: number
  name: string
  description?: string
  imageURL?: string
  imagePublicId?: string
  createdAt: string
  updatedAt?: string
  productsCount?: number
}

export interface AddCategoryDTO {
  name: string
  description?: string
  image?: File
}

export interface UpdateCategoryDTO {
  id: number
  name?: string
  description?: string
  image?: File
}

export interface CategoryParams {
  search?: string
  sortProp?: string
  sortDirection?: "asc" | "desc"
  pageIndex: number
  pageSize: number
}
