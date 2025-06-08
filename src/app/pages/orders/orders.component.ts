
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataTableComponent, TableColumn, TableAction } from '../../components/data-table/data-table.component';
import { OrderService} from '../../services/order.service';
import { Router } from '@angular/router';
import { Order , OrdersResponse, OrdersFilter, OrderStatus } from '../../interfaces/order.interface';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, DataTableComponent],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss'],
})
export class OrdersComponent implements OnInit {
  columns: TableColumn[] = [
    { key: 'orderID', title: 'رقم الطلب', sortable: true, width: '10%' },
    { key: 'name', title: 'اسم العميل', sortable: true, width: '20%' },
    { key: 'orderDate', title: 'تاريخ الطلب', type: 'date', sortable: true, width: '15%' },
    { key: 'totalAmount', title: 'المبلغ الإجمالي', type: 'currency', sortable: true, width: '15%' },
    { key: 'status', title: 'الحالة', type: 'badge', sortable: true, width: '15%' },
  ];

  actions: TableAction[] = [
    { label: 'عرض التفاصيل', icon: 'visibility', action: 'view' },
    { label: 'تحديث الحالة', icon: 'edit', action: 'update' },
    { label: 'حذف', icon: 'delete', action: 'delete', type: 'danger' },
  ];

  orders = signal<Order[]>([]);
  totalItems = signal<number>(0);
  currentPage = signal<number>(1);
  pageSize = signal<number>(10);
  pageSizeOptions = [5, 10, 25, 50];
  totalPagesSignal = signal<number>(1);
  loading = signal<boolean>(false);
  filter = signal<OrdersFilter>({
    pageIndex: 1,
    pageSize: 10,
    search: '',
    userId: '',
    status: undefined,
    sortProp: undefined,
    sortDirection: undefined,
  });
  statusOptions: OrderStatus[] = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
  isModalOpen = false
  isDetailsModalOpen = false
  editingOrder: Order | null = null
  selectedOrder: Order | null = null
  deleteConfirm: { isOpen: boolean; OrderId: number | null } = {
    isOpen: false,
    OrderId: null,
  }
  constructor(private orderService: OrderService, private router: Router) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.loading.set(true);
    const currentFilter = this.filter();
    this.orderService.getOrders(currentFilter).subscribe({
      next: (response: OrdersResponse) => {
        this.orders.set(response.data);
        this.totalItems.set(response.totalCount);
        this.pageSize.set(response.pageSize);
        this.currentPage.set(response.pageIndex || 1);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error fetching orders:', err);
        this.loading.set(false);
      },
    });
  }

  onSearch(searchTerm: string) {
    this.filter.update((f) => ({ ...f, search: searchTerm, pageIndex:1 }));
    this.loadOrders();
  }

  onSort(event: { column: string; direction: 0 | 1 }) {
    const sortPropMap: { [key: string]: number } = {
      orderID: 0,
      name: 1,
      orderDate: 2,
      totalAmount: 3,
      status: 4,
    };
    this.filter.update((f) => ({
      ...f,
      sortProp: sortPropMap[event.column],
      sortDirection: event.direction,
      pageIndex: 1,
    }));
    this.loadOrders();
  }

  onPageChange(page: number) {
    this.filter.update((f) => ({ ...f, pageIndex: page }));
    this.loadOrders();
  }

  onPageSizeChange(size: number) {
    this.filter.update((f) => ({ ...f, pageSize: size, pageIndex: this.currentPage() }));
    this.loadOrders();
  }

  onActionClick(event: { action: string; item: Order }) {
    switch (event.action) {
      case 'view':this.viewDetails(event.item);    ;
        break;
      case 'update':
        this.updateOrderStatus(event.item);
        break;
      case 'delete':
        if (confirm(`هل أنت متأكد من حذف الطلب رقم ${event.item.orderID}؟`)) {
          this.deleteOrder(event.item.orderID);
        }
        break;
    }
  }
    openAddModal(): void {
      this.editingOrder = null
      this.isModalOpen = true
    }
  
    openEditModal(Order: Order): void {
      this.editingOrder = { ...Order }
      this.isModalOpen = true
    }
  
    closeModal(): void {
      this.isModalOpen = false
    }

  updateOrderStatus(order: Order) {
    const newStatus = prompt('أدخل الحالة الجديدة (Pending, Processing, Shipped, Delivered, Cancelled):', order.status);
    if (newStatus && this.statusOptions.includes(newStatus as OrderStatus)) {
      this.orderService.updateOrderStatus(order.orderID, newStatus).subscribe({
        next: () => {
          this.loadOrders();
          alert('تم تحديث حالة الطلب بنجاح');
        },
        error: (err) => {
          console.error('Error updating order status:', err);
          alert('فشل تحديث حالة الطلب');
        },
      });
    } else if (newStatus) {
      alert('حالة غير صالحة');
    }
  }

  deleteOrder(orderId: number) {
    this.orderService.deleteOrder(orderId).subscribe({
      next: () => {
        this.loadOrders();
        alert('تم حذف الطلب بنجاح');
      },
      error: (err) => {
        console.error('Error deleting order:', err);
        alert('فشل حذف الطلب');
      },
    });
  }

  onFilterStatus(status: OrderStatus | undefined) {
    this.filter.update((f) => ({ ...f, status, pageIndex: 1 }));
    this.loadOrders();
  }
totalPages(): number {
  if (!this.totalItems || !this.pageSize) {
    return 1;
  }
  // If totalItems and pageSize are functions, call them
  const total = typeof this.totalItems === 'function' ? this.totalItems() : this.totalItems;
  const size = typeof this.pageSize === 'function' ? this.pageSize() : this.pageSize;
  return Math.ceil(total / size) || 1;
}
onRowClick(event: Order) {
    this.viewDetails(event);
  }



  // Details modal
  viewDetails(Order: Order): void {
    this.selectedOrder = { ...Order }
    this.isDetailsModalOpen = true
  }

  closeDetailsModal(): void {
    this.isDetailsModalOpen = false
    this.selectedOrder = null
  }

  openEditModalFromDetails(Order: Order): void {
    this.editingOrder = { ...Order }
    this.isModalOpen = true
  }

  openDeleteConfirmFromDetails(Order: Order): void {
    this.deleteConfirm = {
      isOpen: true,
      OrderId: Order.orderID,
    }
  }
}