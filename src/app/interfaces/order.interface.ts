// export interface Order {
//   orderID: number;
//   userId: string;
//   name: string;
//   orderDate: string;
//   totalAmount: number;
//   status: OrderStatus;
//   orderItems: OrderItem[];
// }

// export interface OrderItem {
//   orderItemID: number;
//   productID: number;
//   productName: string;
//   quantity: number;
//   price: number;
//   subtotal: number;
// }

// export type OrderStatus =
//   | 'طلب جديد'
//   | 'تحت الاجراء'
//   | 'تم انهاء الطلب'
//   | 'إلغاء الطلب'

// export interface OrdersResponse {
//   pageSize: number;
//   pageIndex: number;
//   totalCount: number;
//   data: Order[];
// }

// export interface OrdersFilter {
//   search?: string;
//   userId?: string;
//   status?: OrderStatus;
//   sortProp?: number;
//   sortDirection?: number;
//   pageIndex: number;
//   pageSize: number;
// }
// export interface OrderRequest {
//   userId: string;
//   orderDate: string;
//   totalAmount: number;
//   status: OrderStatus;
//   orderItems: OrderItem[];
// }
export interface Order {
  id: number;
  date: string;
  status: string;
  userName: string;
  phoneNumber: string;
  email: string;
  address: string;
  orderItems: OrderItem[];
}

export interface OrderItem {
  productId: number;
  productName: string;

  brand: string;
  model: string;
  productStatus: string;
  rentalPeriod: string;
}

export type OrderStatus =
  | 'طلب جديد'
  | 'تحت الاجراء'
  | 'تم انهاء الطلب'
  | 'الغاء الطلب';

export enum StatusOrder {
  pending = 'طلب جديد',
  processing = 'تحت الاجراء',
  delivered = 'تم انهاء الطلب',
  cancelled = 'الغاء الطلب',
}
export interface OrdersResponse {
  pageSize: number;
  pageIndex: number;
  totalCount: number;
  data: Order[];
}

export interface OrdersFilter {
  search?: string;
  productId?: string;
  userId?: string;
  orderStatus?: OrderStatus;
  productStatus?: string;
  RentalPeriod?: string;
  date?: string;
  sortProp?: number;
  sortDirection?: number;
  pageIndex: number;
  pageSize: number;
}
export interface OrderRequest {
  userId: string;
  orderDate: string;
  totalAmount: number;
  status: OrderStatus;
  orderItems: OrderItem[];
}
