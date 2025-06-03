import { Component, OnInit, OnDestroy,  TemplateRef, ViewChild } from "@angular/core"
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from "rxjs"
import { animate, style, transition, trigger } from "@angular/animations"
import { Category, CategoryParams } from "../../interfaces/category"
import { PaginationEvent, RowAction, SortEvent, TableColumn, DataTableComponent } from "../../components/data-table/data-table.component"
import { CategoryService } from "../../services/category.service"
import { PaginationResponse } from "../../interfaces/product.interface"
import { CategoryFormComponent } from "./category-form/category-form.component";
import { FormsModule } from "@angular/forms"
import { CommonModule } from "@angular/common"

@Component({
  selector: "app-categories",
  templateUrl: "./categories.component.html",
  styleUrls: ["./categories.component.scss"],
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
  imports: [CategoryFormComponent, DataTableComponent, FormsModule,CommonModule],
})
export class CategoriesComponent implements OnInit, OnDestroy {
  @ViewChild("expandedRowTemplate") expandedRowTemplate!: TemplateRef<any>

  private destroy$ = new Subject<void>()
  private searchSubject = new Subject<string>()

  categories: Category[] = []
  loading = false
  totalCount = 0
  selectedCategories: Category[] = []
  currentParams: CategoryParams = {
    pageIndex: 1,
    pageSize: 10,
  }

  // View modes and filters
  viewMode: "table" | "grid" = "table"
  showFilters = false
  showBulkActions = false

  // Statistics
  stats = {
    total: 0,
    withImages: 0,
    withoutImages: 0,
    totalProducts: 0,
  }

  // Category form modal
  showCategoryForm = false
  categoryFormMode: "add" | "edit" = "add"
  categoryToEdit: Category | null = null

  // Row actions for the table
  rowActions: RowAction[] = [
    {
      label: "عرض التفاصيل",
      icon: "view",
      action: (item) => this.viewCategory(item),
    },
    {
      label: "تعديل",
      icon: "edit",
      action: (item) => this.editCategory(item),
    },
    {
      label: "نسخ",
      icon: "copy",
      action: (item) => this.duplicateCategory(item),
    },
    {
      label: "حذف",
      icon: "delete",
      color: "#D32F2F",
      action: (item) => this.deleteCategory(item),
      disabled: (item) => (item.productsCount || 0) > 0,
    },
  ]

  // Bulk actions
  bulkActions = [
    { label: "تصدير المحدد", action: () => this.exportSelected() },
    { label: "حذف المحدد", action: () => this.deleteSelected(), color: "#D32F2F" },
    { label: "تحديث الصور", action: () => this.updateImagesSelected() },
  ]

  tableColumns: TableColumn[] = [
    {
      key: "imageURL",
      label: "الصورة",
      type: "image",
      width: "80px",
    },
    {
      key: "name",
      label: "اسم الفئة",
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
      key: "productsCount",
      label: "عدد المنتجات",
      sortable: true,
      type: "text",
      resizable: true,
      width: "120px",
    },
    {
      key: "createdAt",
      label: "تاريخ الإنشاء",
      sortable: true,
      type: "date",
      resizable: true,
    },
    {
      key: "updatedAt",
      label: "آخر تحديث",
      sortable: true,
      type: "date",
      resizable: true,
      hidden: true,
    },
    {
      key: "actions",
      label: "الإجراءات",
      type: "actions",
      width: "60px",
    },
  ]

  constructor(private categoryService: CategoryService) {}

  ngOnInit() {
    this.setupSearchDebounce()
    this.loadCategories()
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
        this.loadCategories()
      })
  }

  loadCategories() {
    this.loading = true

    this.categoryService
      .getAllCategories(this.currentParams)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: PaginationResponse<Category>) => {
          this.categories = response.data
          this.totalCount = response.totalCount
          this.currentParams.pageIndex = response.pageIndex
          this.currentParams.pageSize = response.pageSize
          this.loading = false
          this.calculateStats()
        },
        error: (error) => {
          console.error("Error loading categories:", error)
          this.loading = false
          this.showErrorMessage("حدث خطأ أثناء تحميل الفئات")
        },
      })
  }

  calculateStats() {
    this.stats.total = this.totalCount
    this.stats.withImages = this.categories.filter((c) => c.imageURL).length
    this.stats.withoutImages = this.categories.filter((c) => !c.imageURL).length
    this.stats.totalProducts = this.categories.reduce((sum, c) => sum + (c.productsCount || 0), 0)
  }

  // Category form methods
  openAddCategoryForm() {
    this.categoryFormMode = "add"
    this.categoryToEdit = null
    this.showCategoryForm = true
  }

  openEditCategoryForm(category: Category) {
    this.categoryFormMode = "edit"
    this.categoryToEdit = category
    this.showCategoryForm = true
  }

  closeCategoryForm() {
    this.showCategoryForm = false
    this.categoryToEdit = null
  }

  onCategoryAdded() {
    this.loadCategories()
    this.showSuccessMessage("تم إضافة الفئة بنجاح")
  }

  onCategoryUpdated() {
    this.loadCategories()
    this.showSuccessMessage("تم تحديث الفئة بنجاح")
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
    this.loadCategories()
  }

  onPageChange(event: PaginationEvent) {
    this.currentParams.pageIndex = event.pageIndex
    this.currentParams.pageSize = event.pageSize
    this.loadCategories()
  }

  onSearch(searchTerm: string) {
    this.searchSubject.next(searchTerm)
  }

  onRowSelect(selectedRows: Category[]) {
    this.selectedCategories = selectedRows
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

  // Category actions
  viewCategory(category: Category) {
    console.log("Viewing category:", category)
    // Navigate to category detail page or show details modal
  }

  editCategory(category: Category) {
    // this.openEditCategoryForm(category)
    this.openEditCategoryForm(category)
    // If you want to navigate instead of opening a modal, use Angular Router:
    // this.router.navigate([`/categories/form/${category.id}`])
  }

  duplicateCategory(category: Category) {
    console.log("Duplicating category:", category)
    // Implement duplication logic
    this.showSuccessMessage(`تم نسخ الفئة "${category.name}" بنجاح`)
  }

  deleteCategory(category: Category) {
    if (category.productsCount && category.productsCount > 0) {
      this.showErrorMessage(`لا يمكن حذف الفئة "${category.name}" لأنها تحتوي على ${category.productsCount} منتج`)
      return
    }

    if (confirm(`هل أنت متأكد من حذف الفئة "${category.name}"؟`)) {
      this.categoryService
        .deleteCategory(category.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result) => {
            if (result.isSuccess) {
              this.showSuccessMessage(`تم حذف الفئة "${category.name}" بنجاح`)
              this.loadCategories()
            } else {
              this.showErrorMessage(result.message || "حدث خطأ أثناء حذف الفئة")
            }
          },
          error: (error) => {
            console.error("Error deleting category:", error)
            this.showErrorMessage("حدث خطأ أثناء حذف الفئة")
          },
        })
    }
  }

  // Bulk actions
  exportSelected() {
    console.log("Exporting selected categories:", this.selectedCategories)
    this.showSuccessMessage(`تم تصدير ${this.selectedCategories.length} فئة بنجاح`)
  }

  deleteSelected() {
    const categoriesWithProducts = this.selectedCategories.filter((c) => (c.productsCount || 0) > 0)

    if (categoriesWithProducts.length > 0) {
      this.showErrorMessage(`لا يمكن حذف ${categoriesWithProducts.length} فئة لأنها تحتوي على منتجات`)
      return
    }

    if (confirm(`هل أنت متأكد من حذف ${this.selectedCategories.length} فئة؟`)) {
      console.log("Deleting selected categories:", this.selectedCategories)
      this.showSuccessMessage(`تم حذف ${this.selectedCategories.length} فئة بنجاح`)
      this.selectedCategories = []
      this.showBulkActions = false
      this.loadCategories()
    }
  }

  updateImagesSelected() {
    console.log("Updating images for selected categories:", this.selectedCategories)
    // Show bulk image update modal
  }

  // Utility methods
  refreshData() {
    this.loadCategories()
    this.showSuccessMessage("تم تحديث البيانات بنجاح")
  }

  exportAllCategories() {
    console.log("Exporting all categories")
    this.showSuccessMessage("تم تصدير جميع الفئات بنجاح")
  }

  importCategories() {
    console.log("Importing categories")
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
  getGridCategories() {
    return this.categories
  }

  // Helper methods
  getCategoryImageUrl(category: Category): string {
    return category.imageURL || "/placeholder.svg?height=200&width=200"
  }

  // Enhanced date formatting
  formatDate(dateString: string): string {
    if (!dateString) return ""

    try {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat("ar-SA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date)
    } catch {
      return dateString
    }
  }

  // Truncate text helper
  truncateText(text: string, maxLength = 100): string {
    if (!text) return ""
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text
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

  // Track by functions for performance
  trackByFn(index: number, item: Category): any {
    return item.id || index
  }
}
