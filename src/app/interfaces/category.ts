export interface Category {
  id: number;
  name?: string | null;
  description?: string | null;
  imageURL?: string | null;
  imageThumbnailURL?: string | null;
  imagePublicId: string;
}

export interface AddCategory {
  name: string
  description?: string
  image?: File
}

export interface PaginatedResponse<T> {
  pageSize: number;
  pageIndex: number;
  totalCount: number;
  data: T[];
}

export interface Result {
  isSuccess: boolean;
  message: string;
}

export interface UpdateCategory {
  id: number
  name?: string
  description?: string
  image?: File
}

export enum SortProp {
  Id = 'id',
  Name = 'name',
  Description = 'description'
}

export enum SortDirection {
  Ascending = 0,
  Descending = 1
}

export interface CategoryParams {
  search?: string | null;
  sortProp?: SortProp | null;
  sortDirection?: SortDirection | null;
  pageIndex: number;
  pageSize: number;
}
