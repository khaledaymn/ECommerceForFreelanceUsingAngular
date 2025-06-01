import { Injectable } from "@angular/core"
import {   Observable, of } from "rxjs"
import { delay } from "rxjs/operators"
import   { ApiService } from "./api.service"
import   { Customer } from "../interfaces/customer.interface"
import { MOCK_CUSTOMERS } from "../mock-data/customers.mock"

@Injectable({
  providedIn: "root",
})
export class CustomerService {
  private endpoint = "customers"
  private useMockData = true // Set to false when real API is available

  constructor(private apiService: ApiService) {}

  /**
   * Get all customers with optional filtering
   */
  getCustomers(params?: {
    page?: number
    limit?: number
    search?: string
  }): Observable<{ data: Customer[]; meta: any }> {
    if (this.useMockData) {
      // Filter mock data based on params
      let filteredCustomers = [...MOCK_CUSTOMERS]

      if (params?.search) {
        const searchLower = params.search.toLowerCase()
        filteredCustomers = filteredCustomers.filter(
          (c) =>
            c.name.toLowerCase().includes(searchLower) ||
            c.email.toLowerCase().includes(searchLower)
            // (c.phone && c.phone.includes(params.search)),
        )
      }

      // Pagination
      const page = params?.page || 1
      const limit = params?.limit || 10
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex)

      const meta = {
        total: filteredCustomers.length,
        page,
        limit,
        totalPages: Math.ceil(filteredCustomers.length / limit),
      }

      return of({ data: paginatedCustomers, meta }).pipe(delay(500)) // Simulate network delay
    }

    return this.apiService.getList<Customer>(this.endpoint, params)
  }

  /**
   * Get a single customer by ID
   */
  getCustomer(id: string): Observable<Customer> {
    if (this.useMockData) {
      const customer = MOCK_CUSTOMERS.find((c) => c.id === id)
      if (!customer) {
        throw new Error("العميل غير موجود")
      }
      return of(customer).pipe(delay(300)) // Simulate network delay
    }

    return this.apiService.get<Customer>(`${this.endpoint}/${id}`)
  }

  /**
   * Create a new customer
   */
  createCustomer(
    customer: Omit<Customer, "id" | "orders" | "totalSpent" | "createdAt" | "updatedAt">,
  ): Observable<Customer> {
    if (this.useMockData) {
      const newCustomer: Customer = {
        ...customer,
        id: `cust_${Math.random().toString(36).substr(2, 9)}`,
        orders: [],
        totalSpent: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      return of(newCustomer).pipe(delay(500)) // Simulate network delay
    }

    return this.apiService.post<Customer>(this.endpoint, customer)
  }

  /**
   * Update an existing customer
   */
  updateCustomer(id: string, customer: Partial<Customer>): Observable<Customer> {
    if (this.useMockData) {
      const existingCustomer = MOCK_CUSTOMERS.find((c) => c.id === id)
      if (!existingCustomer) {
        throw new Error("العميل غير موجود")
      }

      const updatedCustomer: Customer = {
        ...existingCustomer,
        ...customer,
        updatedAt: new Date(),
      }

      return of(updatedCustomer).pipe(delay(500)) // Simulate network delay
    }

    return this.apiService.put<Customer>(`${this.endpoint}/${id}`, customer)
  }

  /**
   * Delete a customer
   */
  deleteCustomer(id: string): Observable<void> {
    if (this.useMockData) {
      return of(undefined).pipe(delay(500)) // Simulate network delay
    }

    return this.apiService.delete<void>(`${this.endpoint}/${id}`)
  }
}
