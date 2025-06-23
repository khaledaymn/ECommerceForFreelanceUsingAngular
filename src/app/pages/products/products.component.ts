import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { CategoryService } from '../../services/category.service';
import { Product, ProductParams, ProductStatus } from '../../interfaces/product.interface';
import { Category, CategoryParams } from '../../interfaces/category';
import {
  DataTableComponent,
  TableAction,
  TableColumn,
} from '../../components/data-table/data-table.component';
import { ProductModalComponent } from './modals/product-modal/product-modal.component';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import { ProductDetailsModalComponent } from './modals/product-details-modal/product-details-modal.component';
import { NotificationService } from '../../services/notification.service';

interface AttributeFilter {
  key: string;
  values: { value: string; count: number }[];
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
  errorMessage: string | null = null; // New: To display errors to the user

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  totalItems = 0;

  // Filters
  searchTerm = '';
  statusFilter = '';
  categoryFilter = '';
  brandFilter = '';
  modelFilter = '';
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
  brandSearchTerm = '';
  modelSearchTerm = '';
  attributeSearchTerms: Record<string, string> = {};

  // Available attributes for filtering
  availableAttributes: AttributeFilter[] = [];

  // Modal state
  isModalOpen = false;
  isDetailsModalOpen = false;
  editingProduct: Product | null = null;
  selectedProduct!: Product;
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
    {
      key: 'name',
      title: 'النوع',
      sortable: true,
      width: '20%'
    },
    {
      key: 'categoryName',
      title: 'الفئة',
      sortable: false,
      width: '10%'
    },
    {
      key: 'brand',
      title: 'العلامة التجارية',
      type: 'text',
      sortable: false,
      width: '12%',
      align: 'center',
    },
    {
      key: 'model',
      title: 'الموديل',
      type: 'text',
      sortable: false,
      width: '12%',
      align: 'center',
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
      key: 'quantity',
      title: 'الكميه',
      type: 'currency',
      sortable: false,
      width: '12%',
      align: 'center',
    },
    {
      key: 'createdAt',
      title: 'التاريخ',
      type: 'date',
      sortable: false,
      width: '15%',
      align: 'center',
    },
  ];

  actions: TableAction[] = [
    { label: 'عرض', icon: 'visibility', action: 'view' },
    { label: 'تعديل', icon: 'edit', action: 'edit' },
    { label: 'حذف', icon: 'delete', action: 'delete', type: 'danger' },
  ];

  viewMode: 'table' | 'grid' = 'table';

  constructor(
    private productService: ProductService,
    private notificationService: NotificationService,
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

  selectBrand(brand: string): void {
    this.onBrandFilterChange(brand);
    this.activeDropdown = null;
  }

  selectModel(model: string): void {
    this.onModelFilterChange(model);
    this.activeDropdown = null;
  }

  applyFilters(): void {
    this.closeFiltersPanel();
  }

  getActiveFiltersCount(): number {
    let count = 0;
    if (this.statusFilter) count++;
    if (this.categoryFilter) count++;
    if (this.brandFilter) count++;
    if (this.modelFilter) count++;
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
        this.loading = false;
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
      categoryId: this.categoryFilter ? Number(this.categoryFilter) : undefined,
      brand: this.brandFilter || undefined,
      model: this.modelFilter || undefined,
      sortProp: this.sortColumn as any,
      sortDirection: this.sortDirection as any,
    };

    this.productService.getAllProducts(params).subscribe({
      next: (response) => {
        this.products = response.data;
        this.filteredProducts = this.applyClientSideFilters(response.data);
        this.totalItems = response.totalCount;
        this.totalPages = Math.ceil(response.totalCount / this.pageSize);
        this.extractAvailableAttributes();
        this.loading = false;
        // Clear any previous error messages
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.notificationService.error("خطأ في تحميل البيانات", "فشل في تحميل قائمة المنتجات. يرجى المحاولة مرة أخرى.")
        this.loading = false;
      },
    });
  }

  private applyClientSideFilters(products: Product[]): Product[] {
    let filtered = [...products];

    // Apply attribute filters
    if (Object.keys(this.attributeFilters).length > 0) {
      filtered = filtered.filter((product) => {
        if (!product.additionalAttributes) return false;
        let attributes: Record<string, string>;
        try {
          attributes =
            typeof product.additionalAttributes === 'string'
              ? JSON.parse(product.additionalAttributes)
              : product.additionalAttributes;
        } catch {
          return false;
        }

        return Object.entries(this.attributeFilters).every(([key, values]) => {
          const productValue = String(attributes[key] || '');
          return values.length === 0 || values.includes(productValue);
        });
      });
    }

    return filtered;
  }

  private extractAvailableAttributes(): void {
    const attributesMap = new Map<string, Map<string, number>>();

    this.products.forEach((product) => {
      if (product.additionalAttributes) {
        let attributes: Record<string, string>;
        try {
          attributes =
            typeof product.additionalAttributes === 'string'
              ? JSON.parse(product.additionalAttributes)
              : product.additionalAttributes;
        } catch (error) {
          console.error('Error parsing additional attributes:', error);
          return;
        }

        Object.entries(attributes).forEach(([key, value]) => {
          if (!attributesMap.has(key)) {
            attributesMap.set(key, new Map());
            if (!this.attributeSearchTerms[key]) {
              this.attributeSearchTerms[key] = '';
            }
          }
          const valueMap = attributesMap.get(key)!;
          const stringValue = String(value);
          valueMap.set(stringValue, (valueMap.get(stringValue) || 0) + 1);
        });
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
      case ProductStatus.Purchase.toString():
        return 'status-purchase';
      case ProductStatus.Rent.toString():
        return 'status-rent';
      case ProductStatus.RentAndPurchase.toString():
        return 'status-rent-and-purchase';
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
    return this.products.filter((p) => p.categoryId === categoryId).length;
  }

  getCategoryName(categoryId: string): string {
    const category = this.categories.find(
      (c) => c.id.toString() === categoryId
    );
    return category?.name || 'غير محدد';
  }

  onBrandFilterChange(brand: string): void {
    this.brandFilter = brand;
    this.activeFilter = null;
    this.currentPage = 1;
    this.loadProducts();
  }

  getFilteredBrands(): string[] {
    const allBrands = [...new Set(this.products.map((p) => p.brand || ''))].filter(Boolean);
    if (!this.brandSearchTerm) return allBrands;
    return allBrands.filter((brand) =>
      brand.toLowerCase().includes(this.brandSearchTerm.toLowerCase())
    );
  }

onModelFilterChange(model: string): void {
    this.modelFilter = model;
    this.activeFilter = null;
    this.currentPage = 1;
    this.loadProducts();
  }

  getFilteredModels(): string[] {
    const allModels = [...new Set(this.products.map((p) => p.model || ''))].filter(Boolean);
    if (!this.modelSearchTerm) return allModels;
    return allModels.filter((model) =>
      model.toLowerCase().includes(this.modelSearchTerm.toLowerCase())
    );
  }
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

  hasActiveFilters(): boolean {
    return !!(
      this.statusFilter ||
      this.categoryFilter ||
      this.brandFilter ||
      this.modelFilter
      // this.hasActiveAttributeFilters() ||
      // this.priceFilter.min ||
      // this.priceFilter.max
    );
  }

  clearAllFilters(): void {
    this.statusFilter = '';
    this.categoryFilter = '';
    this.attributeFilters = {};
    this.brandFilter = '';
    this.modelFilter = '';
    // this.priceFilter = { min: null, max: null };
    this.currentPage = 1;
    this.loadProducts();
  }

  openAddModal(): void {
    this.editingProduct = null;
    this.isModalOpen = true;
    this.errorMessage = null; // Clear previous errors
  }

  openEditModal(product: Product): void {
    this.editingProduct = { ...product };
    this.isModalOpen = true;
    this.errorMessage = null; // Clear previous errors
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.editingProduct = null;
    this.errorMessage = null; // Clear errors on close
  }

  saveProduct(productData: any): void {
    this.errorMessage = null; // Clear previous errors
    const formattedAttributes = JSON.stringify(
      productData.additionalAttributes || {}
    );

    if (this.editingProduct) {
      // Update existing product
      this.productService
        .updateProduct({
          id: this.editingProduct.id,
          name: productData.name,
          description: productData.description,
          brand: productData.brand,
          model: productData.model,
          status: productData.status,
          categoryId: productData.categoryId,
          quantity: productData.quantity,
          mainImage: productData.mainImage,
          additionalMedia: productData.additionalMedia || [],
          mediaToDelete: productData.mediaToDelete || [],
          additionalAttributes: formattedAttributes,
        })
        .subscribe({
          next: () => {
            this.notificationService.success("تم التحديث بنجاح", `تم تحديث المنتج "${productData.name}" بنجاح.`)
            this.loadProducts();
            this.closeModal();
          },
          error: (error) => {
            this.errorMessage =
              error.message || 'فشل في تحديث المنتج. حاول مرة أخرى.';
            console.error('Error updating product:', error);
            this.notificationService.error("خطأ في التحديث", "فشل في تحديث المنتج. يرجى المحاولة مرة أخرى.")
          },
        });
    } else {
      // Create new product
      this.productService
        .createProduct({
          name: productData.name,
          description: productData.description,
          brand: productData.brand,
          model: productData.model,
          status: productData.status,
          categoryId: productData.categoryId,
          quantity: productData.quantity,
          mainImage: productData.mainImage,
          additionalMedia: productData.additionalMedia || [],
          additionalAttributes: formattedAttributes
        })
        .subscribe({
          next: () => {
            this.notificationService.success("تم الإنشاء بنجاح", `تم إنشاء المنتج "${productData.name}" بنجاح.`)
            this.loadProducts();
            this.closeModal();
            console.log('Product created successfully', productData);
          },
          error: (error) => {
            this.errorMessage =
              error.message ||
              'فشل في إنشاء المنتج. تأكد من أن جميع الملفات مدعومة.';
            console.error('Error creating product:', error);
             this.notificationService.error("خطأ في الإنشاء", "فشل في إنشاء المنتج. يرجى المحاولة مرة أخرى.")
          },
        });
    }
  }

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
      const productToDelete = this.products.find((p) => p.id === this.deleteConfirm.productId)
      const productName = productToDelete?.name || "المنتج"
      this.productService
        .deleteProduct(this.deleteConfirm.productId)
        .subscribe({
          next: () => {
            this.notificationService.success("تم الحذف بنجاح", `تم حذف المنتج "${productName}" بنجاح.`)
            this.loadProducts();
            this.closeDeleteConfirm();
          },
          error: (error) => {
            console.error('Error deleting product:', error);
            this.notificationService.error("خطأ في الحذف", "فشل في حذف المنتج. يرجى المحاولة مرة أخرى.")
            this.closeDeleteConfirm();
          },
        });
    }
  }

  viewDetails(product: Product): void {
    this.selectedProduct = { ...product };
    this.isDetailsModalOpen = true;
  }

  closeDetailsModal(): void {
    this.isDetailsModalOpen = false;
    this.selectedProduct = null as any; // Reset selected product
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

  // New: Clear error message
  clearError(): void {
    this.errorMessage = null;
  }
}
