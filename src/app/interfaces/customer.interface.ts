import type { Address } from "./address.interface"

export interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  addresses: Address[]
  orders: string[] // Order IDs
  totalSpent: number
  createdAt: Date
  updatedAt: Date
}
