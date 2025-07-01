import {
  Component,
  OnInit,
  HostListener,
  signal,
  computed,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  DataTableComponent,
  TableColumn,
  TableAction,
} from '../../components/data-table/data-table.component';
import { OrderService } from '../../services/order.service';
import { Router } from '@angular/router';
import {
  Order,
  OrdersResponse,
  OrdersFilter,
  OrderStatus,
} from '../../interfaces/order.interface';
import { OrderDetailsComponent } from './order-details/order-details.component';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import { CommonModule } from '@angular/common';
import { SortDirection, SortProp } from '../../interfaces/category';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DataTableComponent,
    OrderDetailsComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss'],
})
export class OrdersComponent implements OnInit {
  columns: TableColumn[] = [
    // { key: 'id', title: 'رقم الطلب', sortable: true, width: '10%' },
    { key: 'userName', title: 'اسم العميل', sortable: true, width: '20%' },
    {
      key: 'date',
      title: 'تاريخ الطلب',
      type: 'date',
      sortable: true,
      width: '15%',
    },
    {
      key: 'productName',
      title: 'اسم المنتج',
      type: 'text',
      sortable: true,
      width: '15%',
    },
    {
      key: 'status',
      title: 'الحالة',
      type: 'badge',
      sortable: true,
      width: '15%',
    },
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
  totalPagesSignal = computed(() => {
    return Math.ceil(this.totalItems() / this.pageSize()) || 1;
  });
  loading = signal<boolean>(true);
  filter = signal<OrdersFilter>({
    pageIndex: 1,
    pageSize: 10,
    search: '',
    userId: '',
    orderStatus: undefined,
    sortProp: 0,
    sortDirection: SortDirection.Descending,
  });

  viewMode: 'table' | 'grid' = 'table';

  statusOptions: OrderStatus[] = [
    'طلب جديد',
    'تحت الاجراء',
    'تم انهاء الطلب',
    'الغاء الطلب',
  ];
  isModalOpen = false;
  isDetailsModalOpen = false;
  editingOrder: Order | null = null;
  selectedOrder!: Order;
  deleteConfirm: { isOpen: boolean; OrderId: number | null } = {
    isOpen: false,
    OrderId: null,
  };

  // Filter state
  showFilters = false;
  activeDropdown = '';
  status: OrderStatus | string = '';
  statusSearchTerm = '';

  constructor(private orderService: OrderService, private router: Router) {}

  ngOnInit() {
    this.loadOrders();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.searchable-select')) {
      this.activeDropdown = '';
    }
  }

  loadOrders() {
    this.loading.set(true);
    const currentFilter = this.filter();
    console.log('Loading orders with filter:', currentFilter);

    this.orderService.getOrders(currentFilter).subscribe({
      next: (response: OrdersResponse) => {
        const flattenedData = response.data.flatMap((order) =>
          order.orderItems.map((item) => ({ ...order, ...item }))
        );
        console.log(flattenedData);
        this.orders.set(flattenedData);
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
    this.filter.update((f) => ({ ...f, search: searchTerm, pageIndex: 1 }));
    this.loadOrders();
  }

  onViewModeChange(viewMode: 'table' | 'grid'): void {
    this.viewMode = viewMode;
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
    this.filter.update((f) => ({ ...f, pageSize: size, pageIndex: 1 }));
    this.loadOrders();
  }

  onActionClick(event: { action: string; item: Order }) {
    switch (event.action) {
      case 'view':
        this.viewDetails(event.item);
        break;
      case 'update':
        this.openEditModal(event.item);
        break;
      case 'delete':
        this.openDeleteConfirm(event.item);
        break;
    }
  }

  openEditModal(order: Order): void {
    this.editingOrder = { ...order };
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.editingOrder = null;
  }

  deleteOrder(orderId: number) {
    this.orderService.deleteOrder(orderId).subscribe({
      next: () => {
        this.loadOrders();
        alert('تم حذف الطلب بنجاح');
      },
      error: (err: any) => {
        console.error('Error deleting order:', err);
        alert('فشل حذف الطلب');
      },
    });
  }

  // Filter panel methods
  toggleFiltersPanel(): void {
    this.showFilters = !this.showFilters;
    if (!this.showFilters) {
      this.activeDropdown = '';
    }
  }

  closeFilterPanel(): void {
    this.showFilters = false;
    this.activeDropdown = '';
  }

  toggleDropdown(dropdown: string): void {
    this.activeDropdown = this.activeDropdown === dropdown ? '' : dropdown;
  }

  selectStatus(status: string): void {
    this.onstatusChange(status as OrderStatus | '');
    this.activeDropdown = '';
  }

  onstatusChange(orderStatus: OrderStatus | string): void {
    this.status = orderStatus;
    const validStatus = this.statusOptions.includes(orderStatus as OrderStatus)
      ? (orderStatus as OrderStatus)
      : undefined;
    this.filter.update((f) => ({
      ...f,
      orderStatus: validStatus,
      pageIndex: 1,
    }));
    this.loadOrders();
  }

  getFilteredStatuses(): string[] {
    const allStatuses = this.statusOptions;
    if (!this.statusSearchTerm) {
      return allStatuses;
    }
    return allStatuses.filter((status) =>
      status.toLowerCase().includes(this.statusSearchTerm.toLowerCase())
    );
  }

  getActiveFiltersCount(): number {
    return this.status ? 1 : 0;
  }

  hasActiveFilters(): boolean {
    return !!this.status;
  }

  clearAllFilters(): void {
    this.status = '';
    this.statusSearchTerm = '';
    this.filter.update((f) => ({ ...f, status: undefined, pageIndex: 1 }));
    this.loadOrders();
  }

  applyFilters(): void {
    this.closeFilterPanel();
    this.loadOrders();
  }

  totalPages(): number {
    return Math.ceil(this.totalItems() / this.pageSize()) || 1;
  }

  onRowClick(order: Order): void {
    this.viewDetails(order);
    console.log('Row clicked:', order);
  }

  // Details modal
  viewDetails(order: Order): void {
    this.selectedOrder = { ...order };
    this.isDetailsModalOpen = true;
    console.log('Viewing details for order:', order);
  }

  closeDetailsModal(): void {
    this.isDetailsModalOpen = false;
    this.selectedOrder = null as any; // Reset selectedOrder
  }

  openEditModalFromDetails(order: Order): void {
    this.editingOrder = { ...order };
    this.isModalOpen = true;
  }

  // Delete management
  openDeleteConfirm(order: Order): void {
    this.deleteConfirm = {
      isOpen: true,
      OrderId: order.id,
    };
  }

  closeDeleteConfirm(): void {
    this.deleteConfirm = {
      isOpen: false,
      OrderId: null,
    };
  }

  // confirmDelete(orderId: string | number | null): void {
  //   if (orderId && typeof orderId === 'number') {
  //     this.deleteOrder(orderId);
  //   }
  //   this.closeDeleteConfirm();
  // }
  confirmDelete(event: string | number | null) {
    // your delete logic here
    if (event !== null && event !== undefined) {
      this.deleteOrder(Number(event));
    }
    this.closeDeleteConfirm();
  }
  updateOrderStatus(event: { orderId: number; status: OrderStatus }): void {
    this.orderService.updateOrderStatus(event.orderId, event.status).subscribe({
      next: () => {
        this.loadOrders();
      },
      error: (err: any) => {
        console.error('Error updating order status:', err);
      },
    });
  }
  getStatusClass(status: string): string {
    switch (status) {
      // Example cases, replace with your actual OrderStatus values
      case this.statusOptions[0]:
        return 'pending';
      case this.statusOptions[1]:
        return 'shipped';
      case this.statusOptions[2]:
        return 'delivered';
      case this.statusOptions[3]:
        return 'cancelled';
      default:
        return status.toLowerCase();
    }
  }
}
