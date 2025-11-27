import {
  Component,
  Input,
  Output,
  EventEmitter,
  type OnInit,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SortDirection } from '../../interfaces/category';
import { ProductStatus } from '../../interfaces/product.interface';
import { StatusOrder } from '../../interfaces/order.interface';

export interface TableColumn {
  key: string;
  title: string;
  sortable?: boolean;
  width?: string;
  type?:
    | 'text'
    | 'image'
    | 'badge'
    | 'currency'
    | 'date'
    | 'actions'
    | 'boolean';
  align?: 'left' | 'center' | 'right';
}

export interface TableAction {
  label: string;
  icon: string;
  action: string;
  type?: 'default' | 'danger';
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss'],
})
export class DataTableComponent implements OnInit {
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() loading = false;
  @Input() selectable = false;
  @Input() actions: TableAction[] = [];
  @Input() emptyMessage = 'لا توجد بيانات متاحة';
  @Input() searchPlaceholder = 'البحث...';
  @Input() showSearch = true;
  @Input() showFilters = false;
  @Input() viewMode: 'table' | 'grid' = 'table';
  @Input() enableViewToggle = true;

  // Pagination inputs
  @Input() currentPage = 1;
  @Input() totalPages = 1;
  @Input() totalItems = 0;
  @Input() pageSize = 10;
  @Input() pageSizeOptions = [5, 10, 25, 50];

  @Output() rowClick = new EventEmitter<any>();
  @Output() actionClick = new EventEmitter<{ action: string; item: any }>();
  @Output() selectionChange = new EventEmitter<any[]>();
  @Output() sortChange = new EventEmitter<{
    column: string;
    direction: 0 | 1;
  }>();
  @Output() searchChange = new EventEmitter<string>();
  @Output() viewModeChange = new EventEmitter<'table' | 'grid'>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  searchTerm = '';
  selectedItems = new Set<any>();
  selectAll = false;
  sortColumn = '';
  sortDirection!: SortDirection;
  activeMenu: number | null = null;

  ngOnInit() {
    // Initialize pagination if not set
    if (this.totalPages === 0 && this.totalItems > 0) {
      this.totalPages = Math.ceil(this.totalItems / this.pageSize);
    }
    if (this.totalPages === 0) {
      this.totalPages = 1;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    this.activeMenu = null;
  }

  get startItem(): number {
    return Math.min(
      (this.currentPage - 1) * this.pageSize + 1,
      this.totalItems
    );
  }

  get endItem(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  }

  get pageNumbers(): (number | -1)[] {
    const delta = 2;
    const range: number[] = [];
    const rangeWithDots: (number | -1)[] = [];

    for (
      let i = Math.max(2, this.currentPage - delta);
      i <= Math.min(this.totalPages - 1, this.currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (this.currentPage - delta > 2) {
      rangeWithDots.push(1, -1);
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (this.currentPage + delta < this.totalPages - 1) {
      rangeWithDots.push(-1, this.totalPages);
    } else if (this.totalPages > 1) {
      rangeWithDots.push(this.totalPages);
    }

    return rangeWithDots;
  }

  onSearch() {
    this.searchChange.emit(this.searchTerm);
  }

  onSort(column: TableColumn, index: number) {
    if (!column.sortable) return;

    if (this.sortColumn === column.key) {
      this.sortDirection = this.sortDirection === 0 ? 1 : 0;
    } else {
      this.sortColumn = column.key;
      this.sortDirection = 0;
    }

    this.sortChange.emit({
      column: column.key,
      direction: this.sortDirection,
    });
  }

  getSortIcon(column: TableColumn): string {
    if (!column.sortable) return '';
    if (this.sortColumn !== column.key) return 'unfold_more';
    return this.sortDirection === 0
      ? 'keyboard_arrow_up'
      : 'keyboard_arrow_down';
  }

  toggleSelectAll(event: any) {
    this.selectAll = event.target.checked;
    if (this.selectAll) {
      this.data.forEach((item) => this.selectedItems.add(item));
    } else {
      this.selectedItems.clear();
    }
    this.selectionChange.emit(Array.from(this.selectedItems));
  }

  toggleItemSelection(item: any, event: any) {
    if (event.target.checked) {
      this.selectedItems.add(item);
    } else {
      this.selectedItems.delete(item);
    }

    this.selectAll = this.selectedItems.size === this.data.length;
    this.selectionChange.emit(Array.from(this.selectedItems));
  }

  isSelected(item: any): boolean {
    return this.selectedItems.has(item);
  }

  onRowClick(item: any) {
    this.rowClick.emit(item);
  }

  onActionClick(action: string, item: any) {
    this.actionClick.emit({ action, item });
    this.activeMenu = null;
  }

  toggleMenu(index: number, event: Event) {
    event.stopPropagation();

    if (this.activeMenu === index) {
      this.activeMenu = null;
      return;
    }

    this.activeMenu = index;

    // Position dropdown after DOM update
    setTimeout(() => {
      const trigger = event.target as HTMLElement;
      const dropdown = trigger
        .closest('.actions-menu')
        ?.querySelector('.menu-dropdown') as HTMLElement;

      if (dropdown) {
        this.positionDropdown(trigger, dropdown);
      }
    }, 0);
  }

  private positionDropdown(trigger: HTMLElement, dropdown: HTMLElement) {
    const triggerRect = trigger.getBoundingClientRect();
    const dropdownRect = dropdown.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Reset positioning
    dropdown.style.position = 'fixed';
    dropdown.style.top = '';
    dropdown.style.left = '';
    dropdown.style.right = '';
    dropdown.style.bottom = '';

    // Calculate optimal position
    let top = triggerRect.bottom + 8;
    let left = triggerRect.right - dropdownRect.width;

    // Adjust if dropdown goes off-screen horizontally
    if (left < 8) {
      left = triggerRect.left;
    }
    if (left + dropdownRect.width > viewportWidth - 8) {
      left = viewportWidth - dropdownRect.width - 8;
    }

    // Adjust if dropdown goes off-screen vertically
    if (top + dropdownRect.height > viewportHeight - 8) {
      top = triggerRect.top - dropdownRect.height - 8;
    }

    // Apply calculated position
    dropdown.style.top = `${top}px`;
    dropdown.style.left = `${left}px`;
  }

  setViewMode(mode: 'table' | 'grid') {
    this.viewMode = mode;
    this.viewModeChange.emit(mode);
  }

  // Pagination methods
  onPageChange(page: number) {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.pageChange.emit(page);
    }
  }

  onPageSizeChange(size: number) {
    this.pageSizeChange.emit(size);
  }

  goToFirstPage() {
    this.onPageChange(1);
  }

  goToPreviousPage() {
    this.onPageChange(this.currentPage - 1);
  }

  goToNextPage() {
    this.onPageChange(this.currentPage + 1);
  }

  goToLastPage() {
    this.onPageChange(this.totalPages);
  }

  getCellValue(item: any, column: TableColumn): any {
    return item[column.key];
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'شراء':
        return 'status-purchase';
      case 'إيجار':
        return 'status-rent';
      case 'بيع':
        return 'status-sale';
      case 'إيجار و بيع':
      case 'بيع و إيجار':
        return 'status-rent-sale';
      case 'إيجار و شراء':
      case 'شراء و إيجار':
        return 'status-purchase-rent';
      case 'بيع و شراء':
      case 'شراء و بيع':
        return 'status-purchase-sale';
      case 'إيجار و بيع و شراء':
      case 'إيجار و شراء و بيع':
      case 'بيع و إيجار و شراء':
      case 'بيع و شراء و إيجار':
      case 'شراء و إيجار و بيع':
      case 'شراء و بيع و إيجار':
        return 'status-all';
      case StatusOrder.pending:
        return 'pending';
      case StatusOrder.processing:
        return 'processing';
      case StatusOrder.delivered:
        return 'delivered';
      case StatusOrder.cancelled:
        return 'cancelled';
      case 'تم الشراء':
        return 'status-purchase-sale';
      case 'تم البيع':
        return 'status-rent-sale';
      case 'تم الإيجار':
        return 'status-rent';
      default:
        return 'status-default';
    }
  }

  formatCurrency(value: number): string {
    return `${value.toFixed(2)} ريال`;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  getImageColumn(): TableColumn | null {
    return this.columns.find((col) => col.type === 'image') || null;
  }

  getDisplayColumns(): TableColumn[] {
    return this.columns.filter(
      (col) =>
        col.type !== 'image' && col.key !== 'name' && col.key !== 'description'
    );
  }

  // Handle image loading errors
  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    const placeholder = img.parentElement?.querySelector('.image-placeholder');
    if (placeholder) {
      img.style.display = 'none';
      (placeholder as HTMLElement).style.display = 'flex';
    } else {
      // Create and show placeholder if it doesn't exist
      const placeholderDiv = document.createElement('div');
      placeholderDiv.className = 'image-placeholder';
      placeholderDiv.innerHTML = '<i class="material-icons">broken_image</i>';
      img.style.display = 'none';
      img.parentElement?.appendChild(placeholderDiv);
    }
  }
}
