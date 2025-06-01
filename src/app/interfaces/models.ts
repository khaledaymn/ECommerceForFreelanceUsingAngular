export interface User {
  id: string
  name: string
  email: string
  role: string
  avatar?: string
  initials?: string
  lastLogin?: Date
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  stock: number
  sku: string
  imageUrl?: string
  status: "active" | "inactive" | "out_of_stock"
  createdAt: Date
  updatedAt: Date
}

export interface Order {
  id: string
  orderNumber: string
  customerId: string
  customerName: string
  customerEmail: string
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  total: number
  items: OrderItem[]
  shippingAddress: Address
  billingAddress: Address
  paymentMethod: string
  createdAt: Date
  updatedAt: Date
}

export interface OrderItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  total: number
}

export interface Address {
  street: string
  city: string
  state: string
  postalCode: string
  country: string
}

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

export interface SalesSummary {
  revenue: number
  orders: number
  products: number
  customers: number
  revenueChange: number
  ordersChange: number
  productsChange: number
  customersChange: number
}

export interface Sale {
  id: string
  customerName: string
  customerEmail: string
  amount: string
  initials: string
  date: Date
}

export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
  }[]
}
