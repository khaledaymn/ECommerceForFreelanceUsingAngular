import { Component, OnInit, HostListener, OnChanges } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { FormControl } from "@angular/forms";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";
import { OrderService } from "../../services/order.service";
import { Order, OrderStatus, OrdersFilter } from "../../interfaces/order.interface";
import { OrderDetailsComponent } from "./order-details/order-details.component";
import { OrderStatusBadgeComponent } from "./order-status-badge/order-status-badge.component";
import { PaginationComponent } from "../../components/pagination/pagination.component";

@Component({
  selector: "app-orders",
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, OrderDetailsComponent, OrderStatusBadgeComponent],
  templateUrl: "./orders.component.html",
  styleUrls: ["./orders.component.scss"],
})
export class OrdersComponent implements OnInit,OnChanges  {
  orders: Order[] = [];
  isLoading = false;
  error: string | null = null;

  // View mode
  viewMode: "table" | "grid" = "table";

  // Pagination
  totalCount = 0;
  pageSize = 10;
  pageIndex = 1;
  pageSizeOptions = [5, 10, 25, 50];

  // Filtering
  searchControl = new FormControl("");
  selectedStatus: OrderStatus | "" = "";
  activeFilter: string | null = null;

  // Sorting
  sortProp = 0; // 0: productName, 1: totalAmount, 2: status
  sortDirection = 0; // 0: descending, 1: ascending

  // Selection
  selectedOrders = new Set<number>();
  selectAll = false;

  // Menu
  activeMenu: number | null = null;

  // Selected order for details
  selectedOrder: Order | null = null;
  showDetails = false;

  // Status options
  statusOptions: OrderStatus[] = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

  // Mobile detection
  isMobile = false;

  constructor(private orderService: OrderService) {
    this.checkMobile();
  }

  @HostListener("window:resize", ["$event"])
  onResize(event: any) {
    this.checkMobile();
  }

  @HostListener("document:click", ["$event"])
  onDocumentClick(event: Event) {
    // Close active menu when clicking outside
    const target = event.target as HTMLElement;
    if (!target.closest(".actions-menu")) {
      this.activeMenu = null;
    }

    // Close active filter when clicking outside
    if (!target.closest(".filter-group")) {
      this.activeFilter = null;
    }
  }

  checkMobile() {
    this.isMobile = window.innerWidth < 768;
    if (this.isMobile) {
      this.viewMode = "grid";
    }
  }

  ngOnInit(): void {
    this.loadOrders();

    // Setup search with debounce
    this.searchControl.valueChanges.pipe(debounceTime(500), distinctUntilChanged()).subscribe((value) => {
      this.pageIndex = 1; // Reset to first page on new search
      this.loadOrders();
    });
  }
  ngOnChanges(): void {
    // Handle any changes if needed
    this.loadOrders();
  }
  loadOrders(): void {
    this.isLoading = true;
    this.error = null;

    const filter: OrdersFilter = {
      pageIndex: this.pageIndex || 1, // Default to 1 if not provided
      pageSize: this.pageSize || 10, // Default to 10 if not provided
      search: this.searchControl.value || undefined,
      status: this.selectedStatus || undefined,
      sortProp: this.sortProp,
      sortDirection: this.sortDirection,
    };

    this.orderService.getOrders(filter).subscribe({
      next: (response) => {
        this.orders = response?.data ?? [];
        this.totalCount = response?.totalCount ?? 0;
        this.pageSize = response?.pageSize ?? 10; // Default to 10 if not provided
        this.pageIndex = response?.pageIndex ?? 1; // Default to 1 if not provided
        this.isLoading = false;
        console.log("filter loaded:", filter);
        console.log("Orders loaded:", this.orders);
        console.log("Total count:", this.totalCount);
        console.log("Page size:", this.pageSize);
        console.log("Page index:", this.pageIndex);

        // Clear selections when data changes
        this.selectedOrders.clear();
        this.selectAll = false;
      },
      error: (err) => {
        console.error("Error loading orders", err);
        this.error = "حدث خطأ أثناء تحميل الطلبات. يرجى المحاولة مرة أخرى.";
        this.isLoading = false;
      },
    });
  }

  setViewMode(mode: "table" | "grid"): void {
    this.viewMode = mode;
  }

  toggleFilter(filterType: string): void {
    this.activeFilter = this.activeFilter === filterType ? null : filterType;
  }

  selectStatus(status: OrderStatus | ""): void {
    this.selectedStatus = status;
    this.activeFilter = null;
    this.pageIndex = 2;
    this.loadOrders();
  }

  toggleMenu(index: number, event: Event): void {
    event.stopPropagation();
    this.activeMenu = this.activeMenu === index ? null : index;
  }

  toggleSelectAll(event: any): void {
    this.selectAll = event.target.checked;
    if (this.selectAll) {
      this.orders.forEach((order) => this.selectedOrders.add(order.orderID));
    } else {
      this.selectedOrders.clear();
    }
  }

  toggleOrderSelection(orderId: number, event: any): void {
    if (event.target.checked) {
      this.selectedOrders.add(orderId);
    } else {
      this.selectedOrders.delete(orderId);
    }

    // Update select all checkbox
    this.selectAll = this.selectedOrders.size === this.orders.length;
  }

  onPageChange(newPageIndex: number): void {
    if (newPageIndex >= 1 && newPageIndex <= this.totalPages && newPageIndex !== this.pageIndex) {
      this.pageIndex = newPageIndex;
      console.log("Changing to page:", newPageIndex);
      this.loadOrders();

      // Scroll to top of container when changing pages
      const container = document.querySelector(".orders-container");
      if (container) {
        container.scrollTop = 0;
      }
    }
  }

  onPageSizeChange(newPageSize: number): void {
    if (newPageSize !== this.pageSize) {
      this.pageSize = newPageSize;
      // this.pageIndex = 1; // Reset to first page when changing page size
      this.loadOrders();
    }
  }

  onSort(prop: number): void {
    if (this.sortProp === prop) {
      // Toggle direction if same property
      this.sortDirection = this.sortDirection === 0 ? 1 : 0;
    } else {
      // Default to descending for new sort property
      this.sortProp = prop;
      this.sortDirection = 0;
    }
    this.pageIndex = 1; // Reset to first page
    this.loadOrders();
  }

  getSortIcon(prop: number): string {
    if (this.sortProp !== prop) return "unfold_more";
    return this.sortDirection === 0 ? "arrow_downward" : "arrow_upward";
  }

  viewOrderDetails(order: Order): void {
    this.selectedOrder = order;
    this.showDetails = true;
    this.activeMenu = null;
  }

  editOrder(order: Order): void {
    // Implement edit functionality
    console.log("Edit order:", order);
    alert(`تعديل الطلب رقم #${order.orderID}`);
    this.activeMenu = null;
  }

  duplicateOrder(order: Order): void {
    // Implement duplicate functionality
    console.log("Duplicate order:", order);
    alert(`نسخ الطلب رقم #${order.orderID}`);
    this.activeMenu = null;
  }

  closeDetails(): void {
    this.showDetails = false;
    this.selectedOrder = null;
  }

  updateOrderStatus(orderId: number, status: OrderStatus): void {
    this.isLoading = true;

    this.orderService.updateOrderStatus(orderId, status).subscribe({
      next: () => {
        // Update the order in the list
        const index = this.orders.findIndex(( o) => o.orderID === orderId);
        if (index !== -1) {
          this.orders[index].status = status;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Error updating order status", err);
        this.error = "حدث خطأ أثناء تحديث حالة الطلب. يرجى المحاولة مرة أخرى.";
        this.isLoading = false;
      },
    });
  }

  deleteOrder(orderId: number): void {
    if (confirm("هل أنت متأكد من رغبتك في حذف هذا الطلب؟")) {
      this.isLoading = true;

      this.orderService.deleteOrder(orderId).subscribe({
        next: () => {
          // Remove the order from the list
          this.orders = this.orders.filter((o) => o.orderID !== orderId);
          this.selectedOrders.delete(orderId);
          this.totalCount--;
          this.isLoading = false;
          alert("تم حذف الطلب بنجاح");
        },
        error: (err) => {
          console.error("Error deleting order", err);
          this.error = "حدث خطأ أثناء حذف الطلب. يرجى المحاولة مرة أخرى.";
          this.isLoading = false;
        },
      });
    }
    this.activeMenu = null;
  }

  // Format date in Arabic
  formatArabicDate(date: string): string {
    const dateObj = new Date(date);
    const day = dateObj.getDate().toString().padStart(2, "0");
    const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
  }

  getStatusLabel(status: OrderStatus): string {
    const statusLabels: Record<OrderStatus, string> = {
      Pending: "قيد الانتظار",
      Processing: "قيد المعالجة",
      Shipped: "تم الشحن",
      Delivered: "تم التسليم",
      Cancelled: "ملغي",
    };
    return statusLabels[status] || status;
  }

  getProductName(order: Order): string {
    return order.orderItems[0]?.productName || "منتج غير محدد";
  }
  getUserName(order: Order): string {
    return order?.name || "منتج غير محدد";
  }

  getProductDescription(order: Order): string {
    const itemsCount = order.orderItems.length;
    if (itemsCount === 1) {
      return "عنصر واحد";
    } else if (itemsCount === 2) {
      return "عنصران";
    } else if (itemsCount <= 10) {
      return `${itemsCount} عناصر`;
    } else {
      return `${itemsCount} عنصراً`;
    }
  }

  // Calculate total pages
  get totalPages(): number {
    return Math.ceil(this.totalCount /this.pageSize);
  }

  // Generate page numbers array for pagination
  get pageNumbers(): number[] {
    const totalPages = this.totalPages;
    const current = this.pageIndex;
    const pages: number[] = [];

    if (totalPages <= 10) {
      // Show all pages if 10 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      // Show ellipsis if current page is not near the beginning
      if (current > 3) {
        pages.push(-1); // Ellipsis
      }

      // Show pages around current page
      const start = Math.max(2, current - 2);
      const end = Math.min(totalPages - 1, current + 2);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Show ellipsis if current page is not near the end
      if (current < totalPages - 2) {
        pages.push(-1); // Ellipsis
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  }

  // Pagination helpers
  get startItem(): number {
    return (this.pageIndex - 1) * this.pageSize + 1;
  }

  get endItem(): number {
    return Math.min(this.pageIndex * this.pageSize, this.totalCount);
  }

  get hasPrevious(): boolean {
    return this.pageIndex > 1;
  }

  get hasNext(): boolean {
    return this.pageIndex < this.totalPages;
  }

  goToFirstPage(): void {
    if (this.pageIndex !== 1) {
      this.pageIndex = 1;
      this.loadOrders();
    }
  }

  goToPreviousPage(): void {
    if (this.hasPrevious) {
      this.pageIndex--;
      this.loadOrders();
    }
  }

  goToNextPage(): void {
    if (this.hasNext) {
      this.pageIndex++;
      this.loadOrders();
    }
  }

  goToLastPage(): void {
    if (this.pageIndex !== this.totalPages) {
      this.pageIndex = this.totalPages;
      this.loadOrders();
    }
  }
}
