import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { CategoryService } from '../../services/category.service';
import { Product, ProductParams } from '../../interfaces/product.interface';
import { Category, CategoryParams } from '../../interfaces/category';
import {
  DataTableComponent,
  TableAction,
  TableColumn,
} from '../../components/data-table/data-table.component';
import { ProductModalComponent } from './modals/product-modal/product-modal.component';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import { ProductDetailsModalComponent } from './modals/product-details-modal/product-details-modal.component';

interface AttributeFilter {
  key: string;
  values: { value: string; count: number }[];
}

interface PricePreset {
  label: string;
  min?: number;
  max?: number;
}

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DataTableComponent,
    ProductModalComponent,
    ConfirmDialogComponent,
    ProductDetailsModalComponent,
  ],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
})
export class ProductManagementComponent implements OnInit {
  // Data
  products: Product[] = [];
  categories: Category[] = [];
  filteredProducts: Product[] = [];
  loading = false;

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  totalItems = 0;

  // Filters
  searchTerm = '';
  statusFilter = '';
  categoryFilter = '';
  attributeFilters: Record<string, string[]> = {};
  priceFilter = { min: null as number | null, max: null as number | null };
  sortColumn = 'name';
  sortDirection: 0 | 1 = 0;
  activeFilter: string | null = null;

  // Filter panel state
  showFilters = false;
  activeDropdown: string | null = null;

  // Filter search terms
  statusSearchTerm = '';
  categorySearchTerm = '';
  attributeSearchTerms: Record<string, string> = {};

  // Available attributes for filtering
  availableAttributes: AttributeFilter[] = [];

  // Price presets
  pricePresets: PricePreset[] = [
    { label: 'أقل من 100 ريال', max: 100 },
    { label: '100 - 500 ريال', min: 100, max: 500 },
    { label: '500 - 1000 ريال', min: 500, max: 1000 },
    { label: 'أكثر من 1000 ريال', min: 1000 },
  ];

  // Modal state
  isModalOpen = false;
  isDetailsModalOpen = false;
  editingProduct: Product | null = null;
  selectedProduct: Product | null = null;
  deleteConfirm: { isOpen: boolean; productId: number | null } = {
    isOpen: false,
    productId: null,
  };

  // Table configuration
  columns: TableColumn[] = [
    {
      key: 'mainImageURL',
      title: 'الصورة',
      type: 'image',
      width: '15%',
      align: 'center',
    },
    { key: 'name', title: 'اسم المنتج', sortable: true, width: '20%' },
    { key: 'categoryName', title: 'الفئة', sortable: false, width: '10%' },
    {
      key: 'price',
      title: 'السعر',
      type: 'currency',
      sortable: true,
      width: '12%',
      align: 'left',
    },
    {
      key: 'status',
      title: 'الحالة',
      type: 'badge',
      sortable: false,
      width: '12%',
      align: 'center',
    },
    {
      key: 'createdAt',
      title: 'التاريخ',
      type: 'date',
      sortable: false,
      width: '10%',
      align: 'center',
    },
  ];

  actions: TableAction[] = [
    { label: 'عرض', icon: 'visibility', action: 'view' },
    { label: 'تعديل', icon: 'edit', action: 'edit' },
    { label: 'نسخ', icon: 'content_copy', action: 'duplicate' },
    { label: 'حذف', icon: 'delete', action: 'delete', type: 'danger' },
  ];

  viewMode: 'table' | 'grid' = 'table';

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.searchable-select')) {
      this.activeDropdown = null;
    }
  }

  // Filter panel methods
  toggleFiltersPanel(): void {
    this.showFilters = !this.showFilters;
    if (!this.showFilters) {
      this.activeDropdown = null;
    }
  }

  closeFiltersPanel(): void {
    this.showFilters = false;
    this.activeDropdown = null;
  }

  toggleDropdown(dropdown: string): void {
    this.activeDropdown = this.activeDropdown === dropdown ? null : dropdown;
  }

  selectStatus(status: string): void {
    this.onStatusFilterChange(status);
    this.activeDropdown = null;
  }

  selectCategory(categoryId: string): void {
    this.onCategoryFilterChange(categoryId);
    this.activeDropdown = null;
  }

  applyFilters(): void {
    this.closeFiltersPanel();
  }

  getActiveFiltersCount(): number {
    let count = 0;
    if (this.statusFilter) count++;
    if (this.categoryFilter) count++;
    if (this.priceFilter.min || this.priceFilter.max) count++;
    count += Object.keys(this.attributeFilters).length;
    return count;
  }

  loadCategories(): void {
    this.loading = true;

    const params: CategoryParams = {
      pageIndex: 1,
      pageSize: 100,
    };

    this.categoryService.getAllCategories(params).subscribe({
      next: (response) => {
        this.categories = response.data;
        //  this.categories.forEach((data)=> console.log(data));
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.loading = false;
      },
    });
  }
  loadProducts(): void {
    this.loading = true;

    const params: ProductParams = {
      pageIndex: this.currentPage,
      pageSize: this.pageSize,
      search: this.searchTerm,
      status: this.statusFilter || undefined,
      categoryId: this.categoryFilter
        ? Number.parseInt(this.categoryFilter)
        : undefined,
      sortProp: this.sortColumn as any, // Cast to SortProp if compatible
      sortDirection: this.sortDirection as any, // Cast to SortDirection if compatible
    };

    this.productService.getAllProducts(params).subscribe({
      next: (response) => {
        this.products = response.data;
        this.filteredProducts = response.data;
        this.totalItems = response.totalCount;
        this.totalPages = Math.ceil(response.totalCount / this.pageSize);
        this.extractAvailableAttributes();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.loading = false;
      },
    });
  }

  private applyClientSideFilters(products: Product[]): Product[] {
    let filtered = [...products];

    // Apply price filter
    if (this.priceFilter.min !== null || this.priceFilter.max !== null) {
      filtered = filtered.filter((product) => {
        const price = product.price;
        const minMatch =
          this.priceFilter.min === null || price >= this.priceFilter.min;
        const maxMatch =
          this.priceFilter.max === null || price <= this.priceFilter.max;
        return minMatch && maxMatch;
      });
    }

    return filtered;
  }

  private extractAvailableAttributes(): void {
    const attributesMap = new Map<string, Map<string, number>>();

    this.products.forEach((product) => {
      if (product.additionalAttributes) {
        try {
          const attributes = JSON.parse(product.additionalAttributes);
          Object.entries(attributes).forEach(([key, value]) => {
            if (!attributesMap.has(key)) {
              attributesMap.set(key, new Map());
              // Initialize search term for this attribute if not exists
              if (!this.attributeSearchTerms[key]) {
                this.attributeSearchTerms[key] = '';
              }
            }
            const valueMap = attributesMap.get(key)!;
            const stringValue = String(value);
            valueMap.set(stringValue, (valueMap.get(stringValue) || 0) + 1);
          });
        } catch (error) {
          console.error('Error parsing additional attributes:', error);
        }
      }
    });

    this.availableAttributes = Array.from(attributesMap.entries())
      .map(([key, valueMap]) => ({
        key,
        values: Array.from(valueMap.entries())
          .map(([value, count]) => ({ value, count }))
          .sort((a, b) => a.value.localeCompare(b.value)),
      }))
      .sort((a, b) => a.key.localeCompare(b.key));
  }

  onSearch(searchTerm: string): void {
    this.searchTerm = searchTerm;
    this.currentPage = 1;
    this.loadProducts();
  }

  onSort(event: { column: string; direction: 0 | 1 }): void {
    this.sortColumn = event.column;
    this.sortDirection = event.direction;
    this.currentPage = 1;
    console.log(event);

    this.loadProducts();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadProducts();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.loadProducts();
  }

  onRowClick(product: Product): void {
    this.viewDetails(product);
  }

  onActionClick(event: { action: string; item: Product }): void {
    switch (event.action) {
      case 'view':
        this.viewDetails(event.item);
        break;
      case 'edit':
        this.openEditModal(event.item);
        break;
      case 'duplicate':
        this.duplicateProduct(event.item);
        break;
      case 'delete':
        this.openDeleteConfirm(event.item);
        break;
    }
  }

  onViewModeChange(mode: 'table' | 'grid'): void {
    this.viewMode = mode;
  }

  toggleFilter(filterType: string): void {
    this.activeFilter = this.activeFilter === filterType ? null : filterType;
  }

  onStatusFilterChange(status: string): void {
    this.statusFilter = status;
    this.activeFilter = null;
    this.currentPage = 1;
    this.loadProducts();
  }

  getFilteredStatuses(): string[] {
    const allStatuses = [...new Set(this.products.map((p) => p.status))];
    if (!this.statusSearchTerm) return allStatuses;
    return allStatuses.filter((status) =>
      status.toLowerCase().includes(this.statusSearchTerm.toLowerCase())
    );
  }

  getStatusCount(status: string): number {
    return this.products.filter((p) => p.status === status).length;
  }

  getTotalProductsCount(): number {
    return this.products.length;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'متوفر':
        return 'status-available';
      case 'غير متوفر':
        return 'status-unavailable';
      case 'قريباً':
        return 'status-coming-soon';
      default:
        return 'status-default';
    }
  }

  onCategoryFilterChange(category: string): void {
    this.categoryFilter = category;
    this.activeFilter = null;
    this.currentPage = 1;
    this.loadProducts();
  }

  getFilteredCategories(): Category[] {
    if (!this.categorySearchTerm) return this.categories;
    return this.categories.filter((category) =>
      category.name
        ?.toLowerCase()
        .includes(this.categorySearchTerm.toLowerCase())
    );
  }

  getCategoryCount(categoryId: number): number {
    console.log('CatId ' + categoryId + this.products);

    return this.products.filter((p) => p.categoryId === categoryId).length;
  }

  getCategoryName(categoryId: string): string {
    const category = this.categories.find(
      (c) => c.id.toString() === categoryId
    );
    return category?.name || 'غير محدد';
  }

  // Attribute filter methods
  getFilteredAttributeValues(
    attribute: AttributeFilter
  ): { value: string; count: number }[] {
    const searchTerm = this.attributeSearchTerms[attribute.key] || '';
    if (!searchTerm) return attribute.values;
    return attribute.values.filter((v) =>
      v.value.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  toggleAttributeValue(key: string, value: string): void {
    if (!this.attributeFilters[key]) {
      this.attributeFilters[key] = [];
    }

    const index = this.attributeFilters[key].indexOf(value);
    if (index > -1) {
      this.attributeFilters[key].splice(index, 1);
      if (this.attributeFilters[key].length === 0) {
        delete this.attributeFilters[key];
      }
    } else {
      this.attributeFilters[key].push(value);
    }

    this.currentPage = 1;
    this.loadProducts();
  }

  isAttributeValueSelected(key: string, value: string): boolean {
    return this.attributeFilters[key]?.includes(value) || false;
  }

  hasActiveAttributeFilters(): boolean {
    return Object.keys(this.attributeFilters).length > 0;
  }

  getActiveAttributeFiltersText(): string {
    const count = Object.values(this.attributeFilters).reduce(
      (sum, values) => sum + values.length,
      0
    );
    return `${count} فلتر نشط`;
  }

  getActiveAttributeFilters(): { key: string; values: string[] }[] {
    return Object.entries(this.attributeFilters).map(([key, values]) => ({
      key,
      values,
    }));
  }

  clearAttributeFilter(key: string): void {
    delete this.attributeFilters[key];
    this.currentPage = 1;
    this.loadProducts();
  }

  clearAllAttributeFilters(): void {
    this.attributeFilters = {};
    this.currentPage = 1;
    this.loadProducts();
  }

  // Price filter methods
  onPriceFilterChange(): void {
    this.currentPage = 1;
    this.filteredProducts = this.applyClientSideFilters(this.products);
  }

  formatPriceRange(): string {
    if (this.priceFilter.min && this.priceFilter.max) {
      return `${this.priceFilter.min} - ${this.priceFilter.max} ريال`;
    } else if (this.priceFilter.min) {
      return `من ${this.priceFilter.min} ريال`;
    } else if (this.priceFilter.max) {
      return `حتى ${this.priceFilter.max} ريال`;
    }
    return '';
  }

  isPricePresetActive(preset: PricePreset): boolean {
    return (
      this.priceFilter.min === (preset.min || null) &&
      this.priceFilter.max === (preset.max || null)
    );
  }

  applyPricePreset(preset: PricePreset): void {
    this.priceFilter.min = preset.min || null;
    this.priceFilter.max = preset.max || null;
    this.onPriceFilterChange();
  }

  clearPriceFilter(): void {
    this.priceFilter = { min: null, max: null };
    this.onPriceFilterChange();
  }

  // General filter methods
  hasActiveFilters(): boolean {
    return !!(
      this.statusFilter ||
      this.categoryFilter ||
      this.hasActiveAttributeFilters() ||
      this.priceFilter.min ||
      this.priceFilter.max
    );
  }

  clearAllFilters(): void {
    this.statusFilter = '';
    this.categoryFilter = '';
    this.attributeFilters = {};
    this.priceFilter = { min: null, max: null };
    this.currentPage = 1;
    this.loadProducts();
  }

  // Modal management
  openAddModal(): void {
    this.editingProduct = null;
    this.isModalOpen = true;
  }

  openEditModal(product: Product): void {
    this.editingProduct = { ...product };
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  saveProduct(productData: any): void {
    if (this.editingProduct) {
      // Update existing product
      console.log('Updating product:', this.editingProduct);
      console.log('Product data:', productData);
      console.log(
        'Product data additonal:',
        JSON.stringify(productData.additionalAttributes)
      );

      this.productService
        .updateProduct({
          id: this.editingProduct.id,
          name: productData.name,
          description: productData.description,
          price: productData.price,
          status: productData.status,
          categoryId: productData.categoryId,
          mainImage: productData.mainImage,
          additionalImages: productData.additionalImages,
          imagesToDelete: productData.imagesToDelete,
          additionalAttributes: JSON.stringify(
            productData.additionalAttributes
          ),
        })
        .subscribe({
          next: (response) => {
            this.loadProducts();
            this.closeModal();
            console.log(response);
          },
          error: (error) => {
            console.error('Error updating product:', error);
          },
        });
    } else {
      // Create new product
      this.productService
        .createProduct({
          name: productData.name,
          description: productData.description,
          price: productData.price,
          status: productData.status,
          categoryId: productData.categoryId,
          mainImage: productData.mainImage,
          additionalImages: productData.additionalImages,
        })
        .subscribe({
          next: () => {
            this.loadProducts();
            this.closeModal();
          },
          error: (error) => {
            console.error('Error creating product:', error);
          },
        });
    }
  }

  duplicateProduct(product: Product): void {
    this.productService
      .createProduct({
        name: `${product.name} (نسخة)`,
        description: product.description,
        price: product.price,
        status: product.status,
        categoryId: product.categoryId,
      })
      .subscribe({
        next: () => {
          this.loadProducts();
        },
        error: (error) => {
          console.error('Error duplicating product:', error);
        },
      });
  }

  // Delete management
  openDeleteConfirm(product: Product): void {
    this.deleteConfirm = {
      isOpen: true,
      productId: product.id,
    };
  }

  closeDeleteConfirm(): void {
    this.deleteConfirm = {
      isOpen: false,
      productId: null,
    };
  }

  confirmDelete(): void {
    if (this.deleteConfirm.productId) {
      this.productService
        .deleteProduct(this.deleteConfirm.productId)
        .subscribe({
          next: () => {
            this.loadProducts();
            this.closeDeleteConfirm();
          },
          error: (error) => {
            console.error('Error deleting product:', error);
            this.closeDeleteConfirm();
          },
        });
    }
  }

  // Details modal
  viewDetails(product: Product): void {
    this.selectedProduct = { ...product };
    this.isDetailsModalOpen = true;
  }

  closeDetailsModal(): void {
    this.isDetailsModalOpen = false;
    this.selectedProduct = null;
  }

  openEditModalFromDetails(product: Product): void {
    this.editingProduct = { ...product };
    this.isModalOpen = true;
  }

  openDeleteConfirmFromDetails(product: Product): void {
    this.deleteConfirm = {
      isOpen: true,
      productId: product.id,
    };
  }
}
