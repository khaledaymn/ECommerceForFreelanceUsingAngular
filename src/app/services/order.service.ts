import { Injectable } from "@angular/core"
import {   Observable, of } from "rxjs"
import { delay } from "rxjs/operators"
import   { ApiService } from "./api.service"
import   { Order } from "../interfaces/order.interface"
import { MOCK_ORDERS } from "../mock-data/orders.mock"

@Injectable({
  providedIn: "root",
})
export class OrderService {
  private endpoint = "orders"
  private useMockData = true // Set to false when real API is available

  constructor(private apiService: ApiService) {}

  /**
   * Get all orders with optional filtering
   */
  getOrders(params?: {
    page?: number
    limit?: number
    search?: string
    status?: string
    customerId?: string
    fromDate?: Date
    toDate?: Date
  }): Observable<{ data: Order[]; meta: any }> {
    if (this.useMockData) {
      // Filter mock data based on params
      let filteredOrders = [...MOCK_ORDERS]

      if (params?.search) {
        const searchLower = params.search.toLowerCase()
        filteredOrders = filteredOrders.filter(
          (o) =>
            o.orderNumber.toLowerCase().includes(searchLower) ||
            o.customerName.toLowerCase().includes(searchLower) ||
            o.customerEmail.toLowerCase().includes(searchLower),
        )
      }

      if (params?.status) {
        filteredOrders = filteredOrders.filter((o) => o.status === params.status)
      }

      if (params?.customerId) {
        filteredOrders = filteredOrders.filter((o) => o.customerId === params.customerId)
      }

      // if (params?.fromDate) {
      //   filteredOrders = filteredOrders.filter((o) => new Date(o.createdAt) >= new Date(params.fromDate))
      // }

      // if (params?.toDate) {
      //   filteredOrders = filteredOrders.filter((o) => new Date(o.createdAt) <= new Date(params.toDate))
      // }

      // Pagination
      const page = params?.page || 1
      const limit = params?.limit || 10
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedOrders = filteredOrders.slice(startIndex, endIndex)

      const meta = {
        total: filteredOrders.length,
        page,
        limit,
        totalPages: Math.ceil(filteredOrders.length / limit),
      }

      return of({ data: paginatedOrders, meta }).pipe(delay(500)) // Simulate network delay
    }

    return this.apiService.getList<Order>(this.endpoint, params)
  }

  /**
   * Get a single order by ID
   */
  getOrder(id: string): Observable<Order> {
    if (this.useMockData) {
      const order = MOCK_ORDERS.find((o) => o.id === id)
      if (!order) {
        throw new Error("الطلب غير موجود")
      }
      return of(order).pipe(delay(300)) // Simulate network delay
    }

    return this.apiService.get<Order>(`${this.endpoint}/${id}`)
  }

  /**
   * Create a new order
   */
  createOrder(order: Omit<Order, "id" | "orderNumber" | "createdAt" | "updatedAt">): Observable<Order> {
    if (this.useMockData) {
      const newOrder: Order = {
        ...order,
        id: `ord_${Math.random().toString(36).substr(2, 9)}`,
        orderNumber: `ORD-${Date.now().toString().substr(-8)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      return of(newOrder).pipe(delay(500)) // Simulate network delay
    }

    return this.apiService.post<Order>(this.endpoint, order)
  }

  /**
   * Update an existing order
   */
  updateOrder(id: string, order: Partial<Order>): Observable<Order> {
    if (this.useMockData) {
      const existingOrder = MOCK_ORDERS.find((o) => o.id === id)
      if (!existingOrder) {
        throw new Error("الطلب غير موجود")
      }

      const updatedOrder: Order = {
        ...existingOrder,
        ...order,
        updatedAt: new Date(),
      }

      return of(updatedOrder).pipe(delay(500)) // Simulate network delay
    }

    return this.apiService.put<Order>(`${this.endpoint}/${id}`, order)
  }

  /**
   * Update order status
   */
  updateOrderStatus(id: string, status: Order["status"]): Observable<Order> {
    if (this.useMockData) {
      const existingOrder = MOCK_ORDERS.find((o) => o.id === id)
      if (!existingOrder) {
        throw new Error("الطلب غير موجود")
      }

      const updatedOrder: Order = {
        ...existingOrder,
        status,
        updatedAt: new Date(),
      }

      return of(updatedOrder).pipe(delay(300)) // Simulate network delay
    }

    return this.apiService.patch<Order>(`${this.endpoint}/${id}/status`, { status })
  }

  /**
   * Delete an order
   */
  deleteOrder(id: string): Observable<void> {
    if (this.useMockData) {
      return of(undefined).pipe(delay(500)) // Simulate network delay
    }

    return this.apiService.delete<void>(`${this.endpoint}/${id}`)
  }
}
