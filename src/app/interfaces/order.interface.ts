
export interface Order {
  orderID: number
  userId: string
  name: string
  orderDate: string
  totalAmount: number
  status: OrderStatus
  orderItems: OrderItem[]
  
}

export interface OrderItem {
  orderItemID: number
  productID: number
  productName: string
  quantity: number
  price: number
  subtotal: number
}

export type OrderStatus = "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled"

export interface OrdersResponse {
  pageSize: number
  pageIndex: number
  totalCount: number
  data: Order[]
}

export interface OrdersFilter {
  search?: string
  userId?: string
  status?: OrderStatus
  sortProp?: number
  sortDirection?: number
  pageIndex: number
  pageSize: number
}
export interface OrderRequest {
  userId: string
  orderDate: string
  totalAmount: number
  status: OrderStatus
  orderItems: OrderItem[]
}