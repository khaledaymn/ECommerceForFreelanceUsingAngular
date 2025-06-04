import { Component, Input, Output, EventEmitter, type OnInit, HostListener } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"

export interface TableColumn {
  key: string
  title: string
  sortable?: boolean
  width?: string
  type?: "text" | "image" | "badge" | "currency" | "date" | "actions"
  align?: "left" | "center" | "right"
}

export interface TableAction {
  label: string
  icon: string
  action: string
  type?: "default" | "danger"
}

@Component({
  selector: "app-data-table",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./data-table.component.html",
  styleUrls: ["./data-table.component.scss"],
})
export class DataTableComponent implements OnInit {
  @Input() columns: TableColumn[] = []
  @Input() data: any[] = []
  @Input() loading = false
  @Input() selectable = false
  @Input() actions: TableAction[] = []
  @Input() emptyMessage = "لا توجد بيانات متاحة"
  @Input() searchPlaceholder = "البحث..."
  @Input() showSearch = true
  @Input() showFilters = false
  @Input() viewMode: "table" | "grid" = "table"
  @Input() enableViewToggle = true

  // Pagination inputs
  @Input() currentPage = 1
  @Input() totalPages = 1
  @Input() totalItems = 0
  @Input() pageSize = 10
  @Input() pageSizeOptions = [5, 10, 25, 50]

  @Output() rowClick = new EventEmitter<any>()
  @Output() actionClick = new EventEmitter<{ action: string; item: any }>()
  @Output() selectionChange = new EventEmitter<any[]>()
  @Output() sortChange = new EventEmitter<{ column: string; direction: "asc" | "desc" }>()
  @Output() searchChange = new EventEmitter<string>()
  @Output() viewModeChange = new EventEmitter<"table" | "grid">()
  @Output() pageChange = new EventEmitter<number>()
  @Output() pageSizeChange = new EventEmitter<number>()

  searchTerm = ""
  selectedItems = new Set<any>()
  selectAll = false
  sortColumn = ""
  sortDirection: "asc" | "desc" = "asc"
  activeMenu: number | null = null

  ngOnInit() {
    // Initialize pagination if not set
    if (this.totalPages === 0 && this.totalItems > 0) {
      this.totalPages = Math.ceil(this.totalItems / this.pageSize)
    }
    if (this.totalPages === 0) {
      this.totalPages = 1
    }
  }

  @HostListener("document:click", ["$event"])
  onDocumentClick(event: Event) {
    this.activeMenu = null
  }

  get startItem(): number {
    return Math.min((this.currentPage - 1) * this.pageSize + 1, this.totalItems)
  }

  get endItem(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalItems)
  }

  get pageNumbers(): (number | -1)[] {
    const delta = 2
    const range: number[] = []
    const rangeWithDots: (number | -1)[] = []

    for (
      let i = Math.max(2, this.currentPage - delta);
      i <= Math.min(this.totalPages - 1, this.currentPage + delta);
      i++
    ) {
      range.push(i)
    }

    if (this.currentPage - delta > 2) {
      rangeWithDots.push(1, -1)
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (this.currentPage + delta < this.totalPages - 1) {
      rangeWithDots.push(-1, this.totalPages)
    } else if (this.totalPages > 1) {
      rangeWithDots.push(this.totalPages)
    }

    return rangeWithDots
  }

  onSearch() {
    this.searchChange.emit(this.searchTerm)
  }

  onSort(column: TableColumn, index: number) {
    if (!column.sortable) return

    if (this.sortColumn === column.key) {
      this.sortDirection = this.sortDirection === "asc" ? "desc" : "asc"
    } else {
      this.sortColumn = column.key
      this.sortDirection = "asc"
    }

    this.sortChange.emit({
      column: column.key,
      direction: this.sortDirection,
    })
  }

  getSortIcon(column: TableColumn): string {
    if (!column.sortable) return ""
    if (this.sortColumn !== column.key) return "unfold_more"
    return this.sortDirection === "asc" ? "keyboard_arrow_up" : "keyboard_arrow_down"
  }

  toggleSelectAll(event: any) {
    this.selectAll = event.target.checked
    if (this.selectAll) {
      this.data.forEach((item) => this.selectedItems.add(item))
    } else {
      this.selectedItems.clear()
    }
    this.selectionChange.emit(Array.from(this.selectedItems))
  }

  toggleItemSelection(item: any, event: any) {
    if (event.target.checked) {
      this.selectedItems.add(item)
    } else {
      this.selectedItems.delete(item)
    }

    this.selectAll = this.selectedItems.size === this.data.length
    this.selectionChange.emit(Array.from(this.selectedItems))
  }

  isSelected(item: any): boolean {
    return this.selectedItems.has(item)
  }

  onRowClick(item: any) {
    this.rowClick.emit(item)
  }

  onActionClick(action: string, item: any) {
    this.actionClick.emit({ action, item })
    this.activeMenu = null
  }

  toggleMenu(index: number, event: Event) {
    event.stopPropagation()
    this.activeMenu = this.activeMenu === index ? null : index
  }

  setViewMode(mode: "table" | "grid") {
    this.viewMode = mode
    this.viewModeChange.emit(mode)
  }

  // Pagination methods
  onPageChange(page: number) {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.pageChange.emit(page)
    }
  }

  onPageSizeChange(size: number) {
    this.pageSizeChange.emit(size)
  }

  goToFirstPage() {
    this.onPageChange(1)
  }

  goToPreviousPage() {
    this.onPageChange(this.currentPage - 1)
  }

  goToNextPage() {
    this.onPageChange(this.currentPage + 1)
  }

  goToLastPage() {
    this.onPageChange(this.totalPages)
  }

  getCellValue(item: any, column: TableColumn): any {
    console.log(item[column.key]);

    return item[column.key]
  }

  getStatusClass(status: string): string {
    switch (status) {
      case "متوفر":
        return "status-available"
      case "غير متوفر":
        return "status-unavailable"
      case "قريباً":
        return "status-coming-soon"
      default:
        return "status-default"
    }
  }

  formatCurrency(value: number): string {
    return `${value.toFixed(2)} ر.س`
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  getImageColumn(): TableColumn | null {
    return this.columns.find((col) => col.type === "image") || null
  }

  getDisplayColumns(): TableColumn[] {
    return this.columns.filter((col) => col.type !== "image" && col.key !== "name" && col.key !== "description")
  }
}
