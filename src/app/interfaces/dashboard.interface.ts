// src/app/interfaces/dashboard-data.interface.ts
export interface DashboardData {
  totalProducts: number; // إجمالي المنتجات
  totalRentProducts: number; // إجمالي المنتجات المستأجرة
  totalPurchaseProducts: number; // إجمالي المنتجات المشتراة
  totalRentAndPurchaseProducts: number; // إجمالي المنتجات المستأجرة والمشتراة
  totalNewOrders: number; // إجمالي الطلبات الجديدة
  totalProcessingOrders: number; // إجمالي الطلبات قيد المعالجة
  totalCompletedOrders: number; // إجمالي الطلبات المنتهية
  totalCancelledOrders: number; // إجمالي الطلبات الملغاة
  totalRentOrders: number; // إجمالي الطلبات المستأجرة
  totalPurchaseOrders: number; // إجمالي الطلبات المشتراة
}
