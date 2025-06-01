import {
  Component,
  Input,
  Output,
  EventEmitter,
  type OnInit,
  ViewChild,
  type ElementRef,
  HostListener,
} from "@angular/core"
import { animate, state, style, transition, trigger } from "@angular/animations"
import { FormsModule } from "@angular/forms"
import { CommonModule } from "@angular/common"

export interface TableColumn {
  key: string
  label: string
  sortable?: boolean
  type?: "text" | "image" | "currency" | "date" | "custom" | "actions"
  width?: string
  minWidth?: string
  maxWidth?: string
  resizable?: boolean
  filterable?: boolean
  hidden?: boolean
}

export interface SortEvent {
  column: string
  direction: "asc" | "desc" | null
}

export interface PaginationEvent {
  pageIndex: number
  pageSize: number
}

export interface RowAction {
  label: string
  icon?: string
  action: (item: any) => void
  color?: string
  disabled?: (item: any) => boolean
}

@Component({
  selector: "app-data-table",
  imports:[FormsModule, CommonModule],
  templateUrl: "./data-table.component.html",
  styleUrls: ["./data-table.component.scss"],
  animations: [
    trigger("detailExpand", [
      state("collapsed", style({ height: "0px", minHeight: "0", overflow: "hidden", opacity: 0 })),
      state("expanded", style({ height: "*", opacity: 1 })),
      transition("expanded <=> collapsed", animate("225ms cubic-bezier(0.4, 0.0, 0.2, 1)")),
    ]),
    trigger("fadeIn", [
      transition(":enter", [
        style({ opacity: 0, transform: "translateY(10px)" }),
        animate("300ms ease-out", style({ opacity: 1, transform: "translateY(0)" })),
      ]),
    ]),
  ],
})
export class DataTableComponent implements OnInit {
  @Input() columns: TableColumn[] = []
  @Input() data: any[] = []
  @Input() loading = false
  @Input() totalCount = 0
  @Input() pageSize = 10
  @Input() pageIndex = 1
  @Input() showPagination = true
  @Input() showSearch = true
  @Input() rowActions: RowAction[] = []
  @Input() selectable = false
  @Input() expandable = false
  @Input() expandTemplate: any
  @Input() showColumnSelector = true
  @Input() stickyHeader = true
  @Input() emptyStateMessage = "لا توجد بيانات للعرض"
  @Input() loadingMessage = "جاري التحميل..."

  @Output() sort = new EventEmitter<SortEvent>()
  @Output() pageChange = new EventEmitter<PaginationEvent>()
  @Output() search = new EventEmitter<string>()
  @Output() rowSelect = new EventEmitter<any[]>()
  @Output() rowClick = new EventEmitter<any>()
  @Output() columnChange = new EventEmitter<TableColumn[]>()

  @ViewChild("tableContainer") tableContainer!: ElementRef

  searchTerm = ""
  currentSort: { column: string; direction: "asc" | "desc" | null } = { column: "", direction: null }
  selectedRows: Set<number> = new Set()
  expandedRow: number | null = null
  visibleColumns: TableColumn[] = []
  columnMenuOpen = false
  activeDropdown: number | null = null
  resizingColumn: string | null = null
  resizeStartX = 0
  originalWidth = 0
  columnWidths: { [key: string]: string } = {}

  // Pagination variables
  pageSizeOptions = [5, 10, 25, 50, 100]
  pageNumbers: number[] = []

  // Skeleton loading
  skeletonRows = Array(5)
    .fill(0)
    .map((_, i) => i)

  ngOnInit() {
    this.visibleColumns = this.columns.filter((col) => !col.hidden)
    this.updatePageNumbers()
  }

  updatePageNumbers() {
    const totalPages = this.totalPages
    const currentPage = this.pageIndex

    let startPage = Math.max(1, currentPage - 2)
    const endPage = Math.min(totalPages, startPage + 4)

    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4)
    }

    this.pageNumbers = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i)
  }

  onSort(column: TableColumn) {
    if (!column.sortable) return

    if (this.currentSort.column === column.key) {
      // Toggle direction
      if (this.currentSort.direction === "asc") {
        this.currentSort.direction = "desc"
      } else if (this.currentSort.direction === "desc") {
        this.currentSort.direction = null
      } else {
        this.currentSort.direction = "asc"
      }
    } else {
      this.currentSort.column = column.key
      this.currentSort.direction = "asc"
    }

    this.sort.emit({
      column: this.currentSort.direction ? column.key : "",
      direction: this.currentSort.direction,
    })
  }

  onPageChange(newPageIndex: number) {
    if (newPageIndex < 1 || newPageIndex > this.totalPages) return

    this.pageIndex = newPageIndex
    this.pageChange.emit({
      pageIndex: this.pageIndex,
      pageSize: this.pageSize,
    })

    this.updatePageNumbers()
    this.scrollToTop()
  }

  onPageSizeChange(newPageSize: number) {
    this.pageSize = newPageSize
    this.pageIndex = 1
    this.pageChange.emit({
      pageIndex: this.pageIndex,
      pageSize: this.pageSize,
    })

    this.updatePageNumbers()
    this.scrollToTop()
  }

  scrollToTop() {
    if (this.tableContainer) {
      this.tableContainer.nativeElement.scrollTop = 0
    }
  }

  onSearch() {
    this.search.emit(this.searchTerm)
  }

  onClearSearch() {
    this.searchTerm = ""
    this.search.emit("")
  }

  getNestedValue(obj: any, path: string): any {
    return path.split(".").reduce((current, prop) => current?.[prop], obj)
  }

  get totalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize)
  }

  get startIndex(): number {
    return (this.pageIndex - 1) * this.pageSize + 1
  }

  get endIndex(): number {
    return Math.min(this.pageIndex * this.pageSize, this.totalCount)
  }

  get allSelected(): boolean {
    return this.data.length > 0 && this.selectedRows.size === this.data.length
  }

  get someSelected(): boolean {
    return this.selectedRows.size > 0 && !this.allSelected
  }

  parseAdditionalAttributes(attributesJson: string): any {
    try {
      return JSON.parse(attributesJson)
    } catch {
      return {}
    }
  }

  toggleAllRows() {
    if (this.allSelected) {
      this.selectedRows.clear()
    } else {
      this.data.forEach((item, index) => {
        this.selectedRows.add(index)
      })
    }
    this.emitSelectedRows()
  }

  toggleRow(index: number, event: Event) {
    event.stopPropagation()

    if (this.selectedRows.has(index)) {
      this.selectedRows.delete(index)
    } else {
      this.selectedRows.add(index)
    }
    this.emitSelectedRows()
  }

  isSelected(index: number): boolean {
    return this.selectedRows.has(index)
  }

  emitSelectedRows() {
    const selectedItems = Array.from(this.selectedRows).map((index) => this.data[index])
    this.rowSelect.emit(selectedItems)
  }

  toggleRowExpansion(index: number, event: Event) {
    event.stopPropagation()
    this.expandedRow = this.expandedRow === index ? null : index
  }

  isExpanded(index: number): boolean {
    return this.expandedRow === index
  }

  onRowClick(item: any, index: number) {
    this.rowClick.emit(item)
  }

  toggleColumnVisibility(column: TableColumn) {
    column.hidden = !column.hidden
    this.visibleColumns = this.columns.filter((col) => !col.hidden)
    this.columnChange.emit(this.columns)
  }

  toggleColumnMenu() {
    this.columnMenuOpen = !this.columnMenuOpen
  }

  toggleDropdown(index: number, event: Event) {
    event.stopPropagation()
    this.activeDropdown = this.activeDropdown === index ? null : index
  }

  closeDropdowns() {
    this.activeDropdown = null
  }

  executeAction(action: RowAction, item: any, event: Event) {
    event.stopPropagation()
    if (typeof action.action === "function") {
      action.action(item)
    }
    this.closeDropdowns()
  }

  isActionDisabled(action: RowAction, item: any): boolean {
    return action.disabled ? action.disabled(item) : false
  }

  // Column resizing
  onResizeStart(event: MouseEvent, column: TableColumn) {
    event.preventDefault()
    this.resizingColumn = column.key
    this.resizeStartX = event.pageX

    const headerCell = (event.target as HTMLElement).closest("th")
    if (headerCell) {
      this.originalWidth = headerCell.offsetWidth
    }

    document.addEventListener("mousemove", this.onResizeMove)
    document.addEventListener("mouseup", this.onResizeEnd)
  }

  @HostListener("document:mousemove", ["$event"])
  onResizeMove = (event: MouseEvent) => {
    if (!this.resizingColumn) return

    const diff = event.pageX - this.resizeStartX
    const newWidth = Math.max(100, this.originalWidth + diff)

    this.columnWidths[this.resizingColumn] = `${newWidth}px`
  }

  @HostListener("document:mouseup")
  onResizeEnd = () => {
    this.resizingColumn = null
    document.removeEventListener("mousemove", this.onResizeMove)
    document.removeEventListener("mouseup", this.onResizeEnd)
  }

  getColumnWidth(column: TableColumn): string {
    return this.columnWidths[column.key] || column.width || "auto"
  }

  trackByFn(index: number, item: any): any {
    return item.id || index
  }

  trackByColumnFn(index: number, column: TableColumn): string {
    return column.key
  }
}
