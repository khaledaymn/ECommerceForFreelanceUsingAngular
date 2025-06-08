export interface User {
  id: string;
  fName: string;
  lName: string;
  email: string;
  phoneNumber: string;
  address: string;
}

export interface UsersResponse {
  pageSize: number;
  pageIndex: number;
  totalCount: number;
  data: User[];
}

export interface UsersFilter {
  search?: string;
  sortProp?: number;
  sortDirection?: number;
  pageIndex: number;
  pageSize: number;
  isDeleted?: boolean;
}