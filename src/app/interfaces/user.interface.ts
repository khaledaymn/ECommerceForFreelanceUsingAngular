export interface User {
  id: string;
  fName: string;
  lName: string;
  email: string;
  phoneNumber: string;
  address: string;
  isDeleted: boolean;
}

export interface UsersResponse {
  data: User[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
}

export interface UsersFilter {
  pageIndex: number;
  pageSize: number;
  search?: string;
  sortProp?: number;
  sortDirection?: 0 | 1;
  isDeleted?: boolean;
  isBlocked?: boolean;
}

export interface UserDTO {
  id: string;
  fName: string;
  lName: string;
  email: string;
  phoneNumber?: string;
  address?: string;
}
