import { Component, OnInit, OnDestroy, TemplateRef, ViewChild } from "@angular/core"
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from "rxjs"
import { animate, style, transition, trigger } from "@angular/animations"
import { ProductService } from "../../services/product.service"
import { CommonModule, KeyValue } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { PaginationResponse, Product, ProductParams } from "../../interfaces/product.interface"
import { RowAction, SortEvent, TableColumn, DataTableComponent, PaginationEvent } from "../../components/data-table/data-table.component"

@Component({
  selector: "app-products",
  imports: [CommonModule, FormsModule, DataTableComponent],
  templateUrl: "./products.component.html",
  styleUrls: ["./products.component.scss"],
  animations: [
    trigger("slideIn", [
      transition(":enter", [
        style({ opacity: 0, transform: "translateY(20px)" }),
        animate("300ms ease-out", style({ opacity: 1, transform: "translateY(0)" })),
      ]),
    ]),
    trigger("fadeIn", [
      transition(":enter", [style({ opacity: 0 }), animate("200ms ease-out", style({ opacity: 1 }))]),
    ]),
    trigger("scaleIn", [
      transition(":enter", [
        style({ opacity: 0, transform: "scale(0.95)" }),
        animate("200ms ease-out", style({ opacity: 1, transform: "scale(1)" })),
      ]),
    ]),
  ],
})
export class ProductsComponent implements OnInit, OnDestroy {
  @ViewChild("expandedRowTemplate") expandedRowTemplate!: TemplateRef<any>

  private destroy$ = new Subject<void>()
  private searchSubject = new Subject<string>()

  products: Product[] = []
  loading = false
  totalCount = 0
  selectedProducts: Product[] = []
  currentParams: ProductParams = {
    pageIndex: 1,
    pageSize: 50,
  }

  // View modes and filters
  viewMode: "table" | "grid" = "table"
  showFilters = false
  showBulkActions = false

  // Filter options
  categories: string[] = []
  brands: string[] = []
  statuses: string[] = []

  // Active filters
  activeFilters = {
    category: "",
    brand: "",
    status: "",
    priceRange: { min: 0, max: 10000 },
  }

  // Statistics
  stats = {
    total: 0,
    available: 0,
    outOfStock: 0,
    totalValue: 0,
  }

  // Row actions for the table
  rowActions: RowAction[] = [
    {
      label: "عرض التفاصيل",
      icon: "view",
      action: (item) => this.viewProduct(item),
    },
    {
      label: "تعديل",
      icon: "edit",
      action: (item) => this.editProduct(item),
    },
    {
      label: "حذف",
      icon: "delete",
      color: "#D32F2F",
      action: (item) => this.deleteProduct(item),
      disabled: (item) => item.status === "محجوز",
    },
  ]

  // Bulk actions
  bulkActions = [
    { label: "تصدير المحدد", action: () => this.exportSelected() },
    { label: "حذف المحدد", action: () => this.deleteSelected(), color: "#D32F2F" },
    { label: "تغيير الحالة", action: () => this.changeStatusSelected() },
  ]

  tableColumns: TableColumn[] = [
    {
      key: "mainImageURL",
      label: "الصورة",
      type: "image",
      width: "80px",
    },
    {
      key: "name",
      label: "اسم المنتج",
      sortable: true,
      type: "text",
      resizable: true,
      filterable: true,
    },
    {
      key: "description",
      label: "الوصف",
      type: "text",
      resizable: true,
      hidden: false,
    },
    {
      key: "categoryName",
      label: "الفئة",
      sortable: true,
      type: "text",
      resizable: true,
      filterable: true,
    },
    {
      key: "brandName",
      label: "العلامة التجارية",
      sortable: true,
      type: "text",
      resizable: true,
      filterable: true,
    },
    {
      key: "price",
      label: "السعر",
      sortable: true,
      type: "currency",
      resizable: true,
    },
    {
      key: "status",
      label: "الحالة",
      type: "text",
      resizable: true,
      filterable: true,
    },
    {
      key: "additionalAttributes",
      label: "المواصفات الإضافية",
      type: "custom",
      resizable: true,
      hidden: true,
    },
    {
      key: "createdAt",
      label: "تاريخ الإنشاء",
      sortable: true,
      type: "date",
      resizable: true,
    },
    {
      key: "actions",
      label: "الإجراءات",
      type: "actions",
      width: "60px",
    },
  ]

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.setupSearchDebounce()
    this.loadProducts()
    this.loadFilterOptions()
  }

  ngOnDestroy() {
    this.destroy$.next()
    this.destroy$.complete()
  }

  private setupSearchDebounce() {
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((searchTerm) => {
        this.currentParams.search = searchTerm || undefined
        this.currentParams.pageIndex = 1
        this.loadProducts()
      })
  }

  loadProducts() {
    this.loading = true

    // Apply active filters to params
    const params = { ...this.currentParams }
    if (this.activeFilters.category) {
      params.categoryId = Number.parseInt(this.activeFilters.category)
    }
    if (this.activeFilters.brand) {
      params.brandId = Number.parseInt(this.activeFilters.brand)
    }
    if (this.activeFilters.status) {
      params.status = this.activeFilters.status
    }

    this.productService
      .getAllProducts(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: PaginationResponse<Product>) => {
          this.products = response.data
          this.totalCount = response.totalCount
          this.currentParams.pageIndex = response.pageIndex
          this.currentParams.pageSize = response.pageSize
          this.loading = false
          this.calculateStats()
        },
        error: (error) => {
          console.error("Error loading products:", error)
          this.loading = false
          this.showErrorMessage("حدث خطأ أثناء تحميل المنتجات")
        },
      })
  }

  loadFilterOptions() {
    // Extract unique values from products for filters
    // In a real app, these would come from separate API calls
    this.categories = ["الكل", "فئة 1", "فئة 2", "فئة 3"]
    this.brands = ["الكل", "علامة 1", "علامة 2", "علامة 3"]
    this.statuses = ["الكل", "متاح", "غير متاح", "محجوز"]
  }

  calculateStats() {
    this.stats.total = this.totalCount
    this.stats.available = this.products.filter((p) => p.status === "متاح").length
    this.stats.outOfStock = this.products.filter((p) => p.status === "غير متاح").length
    this.stats.totalValue = this.products.reduce((sum, p) => sum + p.price, 0)
  }

  // Event handlers
  onSort(event: SortEvent) {
    if (event.column && event.direction) {
      this.currentParams.sortProp = event.column
      this.currentParams.sortDirection = event.direction
    } else {
      this.currentParams.sortProp = undefined
      this.currentParams.sortDirection = undefined
    }
    this.currentParams.pageIndex = 1
    this.loadProducts()
  }

  onPageChange(event: PaginationEvent) {
    this.currentParams.pageIndex = event.pageIndex
    this.currentParams.pageSize = event.pageSize
    this.loadProducts()
  }

  onSearch(searchTerm: string) {
    this.searchSubject.next(searchTerm)
  }

  onRowSelect(selectedRows: Product[]) {
    this.selectedProducts = selectedRows
    this.showBulkActions = selectedRows.length > 0
  }

  onColumnChange(columns: TableColumn[]) {
    this.tableColumns = columns
  }

  // View mode toggle
  toggleViewMode() {
    this.viewMode = this.viewMode === "table" ? "grid" : "table"
  }

  // Filter methods
  toggleFilters() {
    this.showFilters = !this.showFilters
  }

  applyFilters() {
    this.currentParams.pageIndex = 1
    this.loadProducts()
  }

  clearFilters() {
    this.activeFilters = {
      category: "",
      brand: "",
      status: "",
      priceRange: { min: 0, max: 10000 },
    }
    this.applyFilters()
  }

  // Product actions
  viewProduct(product: Product) {
    console.log("Viewing product:", product)
    // Navigate to product detail page
  }

  editProduct(product: Product) {
    console.log("Editing product:", product)
    // Navigate to product edit page
  }

  duplicateProduct(product: Product) {
    console.log("Duplicating product:", product)
    // Implement duplication logic
    this.showSuccessMessage(`تم نسخ المنتج "${product.name}" بنجاح`)
  }

  deleteProduct(product: Product) {
    if (confirm(`هل أنت متأكد من حذف المنتج "${product.name}"؟`)) {
      console.log("Deleting product:", product)
      // Implement delete logic
      this.showSuccessMessage(`تم حذف المنتج "${product.name}" بنجاح`)
      this.loadProducts()
    }
  }

  // Bulk actions
  exportSelected() {
    console.log("Exporting selected products:", this.selectedProducts)
    this.showSuccessMessage(`تم تصدير ${this.selectedProducts.length} منتج بنجاح`)
  }

  deleteSelected() {
    if (confirm(`هل أنت متأكد من حذف ${this.selectedProducts.length} منتج؟`)) {
      console.log("Deleting selected products:", this.selectedProducts)
      this.showSuccessMessage(`تم حذف ${this.selectedProducts.length} منتج بنجاح`)
      this.selectedProducts = []
      this.showBulkActions = false
      this.loadProducts()
    }
  }

  changeStatusSelected() {
    console.log("Changing status for selected products:", this.selectedProducts)
    // Show status change modal
  }

  // Utility methods
  refreshData() {
    this.loadProducts()
    this.showSuccessMessage("تم تحديث البيانات بنجاح")
  }

  addNewProduct() {
    console.log("Adding new product")
    // Navigate to add product page
  }

  exportAllProducts() {
    console.log("Exporting all products")
    this.showSuccessMessage("تم تصدير جميع المنتجات بنجاح")
  }

  importProducts() {
    console.log("Importing products")
    // Show import modal
  }

  // Notification methods
  private showSuccessMessage(message: string) {
    // Implement toast notification
    console.log("Success:", message)
  }

  private showErrorMessage(message: string) {
    // Implement toast notification
    console.log("Error:", message)
  }

  // Grid view methods
  getGridProducts() {
    return this.products
  }

  // Helper methods
  getStatusColor(status: string): string {
    const statusColors: { [key: string]: string } = {
      متاح: "#4CAF50",
      "غير متاح": "#F44336",
      محجوز: "#FF9800",
      "قيد المراجعة": "#2196F3",
      مؤرشف: "#9E9E9E",
    }
    return statusColors[status] || "#9E9E9E"
  }

  formatPrice(price: number): string {
    if (!price || isNaN(price)) return "0 ر.س"

    return new Intl.NumberFormat("ar-SA", {
      style: "currency",
      currency: "SAR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price)
  }

  getProductImageUrl(product: Product): string {
    return product.mainImageURL || "/placeholder.svg?height=200&width=200"
  }

  // Enhanced date formatting
  // formatDate(dateString: string): string {
  //   if (!dateString) return ""

  //   try {
  //     const date = new Date(dateString)
  //     return new Intl.DateTimeFormat("ar-SA", {
  //       year: "numeric",
  //       month: "2-digit",
  //       day: "2-digit",
  //       hour: "2-digit",
  //       minute: "2-digit",
  //     }).format(date)
  //   } catch {
  //     return dateString
  //   }
  // }


  formatDate(dateString: string): string {
    if (!dateString) return '';

    try {
      const date = new Date(dateString);

      // Format the date part (DD/MM/YYYY)
      const datePart = new Intl.DateTimeFormat('ar-EG', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(date);

      // Format the time part (HH:MM ص/م)
      const timePart = new Intl.DateTimeFormat('ar-EG', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
        .format(date)
        .replace(/,/, '')
        .replace(/(\d+:\d+\s[صم]+)/, '$1');

      // Combine the parts with extra spaces between date and time
      return `${datePart} م    ${timePart}`; // Added three extra spaces
    } catch {
      return dateString;
    }
  }
  // Safe array access
  getProductImages(product: Product): any[] {
    return product.productImages || []
  }

  // Status badge class helper
  getStatusBadgeClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      متاح: "status-available",
      "غير متاح": "status-unavailable",
      محجوز: "status-reserved",
      "قيد المراجعة": "status-pending",
      مؤرشف: "status-archived",
    }
    return statusClasses[status] || "status-default"
  }

  // Truncate text helper
   truncateText(text: string, maxLength = 100): string {
    if (!text) return ""
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text
  }

  // Check if product has additional images
  hasAdditionalImages(product: Product): boolean {
    return product.productImages && product.productImages.length > 0
  }

  // Get additional attributes count
  getAttributesCount(attributesJson: string): number {
    try {
      const attrs = JSON.parse(attributesJson || "{}")
      return Object.keys(attrs).length
    } catch {
      return 0
    }
  }

  // Safe number formatting
  safeNumber(value: any): number {
    const num = Number(value)
    return isNaN(num) ? 0 : num
  }

  // Calculate pagination info
  getPaginationInfo(): { start: number; end: number; total: number } {
    const start = (this.currentParams.pageIndex - 1) * this.currentParams.pageSize + 1
    const end = Math.min(this.currentParams.pageIndex * this.currentParams.pageSize, this.totalCount)
    return { start, end, total: this.totalCount }
  }

  // Get total pages
  getTotalPages(): number {
    return Math.ceil(this.totalCount / this.currentParams.pageSize)
  }

  // Helper methods for template
  parseAdditionalAttributes(attributesJson: string): any {
    try {
      return JSON.parse(attributesJson || "{}")
    } catch {
      return {}
    }
  }

  // Math utility for template
  get Math() {
    return Math
  }

  // Track by functions for performance
  trackByFn(index: number, item: Product): any {
    return item.id || index
  }
  
  // trackByProduct(index: number, item: Product): number {
  //   return item.id; // Assuming 'id' is a unique identifier for Product
  // }

  // trackByAttribute(index: number, item: KeyValue<string, string>): KeyValue<string, string> {
  //   return item;
  // }
}
