import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { ProductService } from "../../services/product.service"
import { CategoryService } from "../../services/category.service"
import { Product, ProductParams } from "../../interfaces/product.interface"
import { Category } from "../../interfaces/category"
import { DataTableComponent, TableAction, TableColumn } from "../../components/data-table/data-table.component"
import { ProductModalComponent } from "./modals/product-modal/product-modal.component"
import { ConfirmDialogComponent } from "../../components/confirm-dialog/confirm-dialog.component"
import { ProductDetailsModalComponent } from "./modals/product-details-modal/product-details-modal.component"

@Component({
  selector: "app-product",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DataTableComponent,
    ProductModalComponent,
    ConfirmDialogComponent,
    ProductDetailsModalComponent,
  ],
  templateUrl: "./products.component.html",
  styleUrls: ["./products.component.scss"],
})
export class ProductManagementComponent implements OnInit {
  // Data
  products: Product[] = []
  categories: Category[] = []
  filteredProducts: Product[] = []
  loading = false

  // Pagination
  currentPage = 1
  pageSize = 10
  totalPages = 1
  totalItems = 0

  // Filters
  searchTerm = ""
  statusFilter = ""
  categoryFilter = ""
  sortColumn = "name"
  sortDirection: 0 | 1 = 0
  activeFilter: string | null = null

  // Modal state
  isModalOpen = false
  isDetailsModalOpen = false
  editingProduct: Product | null = null
  selectedProduct: Product | null = null
  deleteConfirm: { isOpen: boolean; productId: number | null } = {
    isOpen: false,
    productId: null,
  }

  // Table configuration
  columns: TableColumn[] = [
    { key: "mainImageUrl", title: "الصورة", type: "image", width: "80px", align: "center" },
    { key: "name", title: "اسم المنتج", sortable: true, width: "25%" },
    { key: "categoryName", title: "الفئة", sortable: false, width: "15%" },
    { key: "price", title: "السعر", type: "currency", sortable: true, width: "12%", align: "left" },
    { key: "status", title: "الحالة", type: "badge", sortable: false, width: "12%", align: "center" },
    { key: "createdAt", title: "التاريخ", type: "date", sortable: false, width: "10%", align: "center" },
  ]

  actions: TableAction[] = [
    { label: "عرض", icon: "visibility", action: "view" },
    { label: "تعديل", icon: "edit", action: "edit" },
    { label: "نسخ", icon: "content_copy", action: "duplicate" },
    { label: "حذف", icon: "delete", action: "delete", type: "danger" },
  ]

  viewMode: "table" | "grid" = "table"

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
  ) {}

  ngOnInit(): void {
    this.loadCategories()
    this.loadProducts()
  }

  loadCategories(): void {
    this.categoryService
      .getAllCategories({
        pageIndex: 1,
        pageSize: 100,
      })
      .subscribe({
        next: (response) => {
          this.categories = response.data
        },
        error: (error) => {
          console.error("Error loading categories:", error)
        },
      })
  }

  loadProducts(): void {
    this.loading = true

    const params: ProductParams = {
      pageIndex: this.currentPage,
      pageSize: this.pageSize,
      search: this.searchTerm,
      status: this.statusFilter || undefined,
      categoryId: this.categoryFilter ? Number.parseInt(this.categoryFilter) : undefined,
      sortProp: this.sortColumn as any, // Cast to SortProp if compatible
      sortDirection: this.sortDirection as any // Cast to SortDirection if compatible
    }

    this.productService.getAllProducts(params).subscribe({
      next: (response) => {
        this.products = response.data
        this.filteredProducts = response.data
        this.totalItems = response.totalCount
        this.totalPages = Math.ceil(response.totalCount / this.pageSize)
        this.loading = false
      },
      error: (error) => {
        console.error("Error loading products:", error)
        this.loading = false
      },
    })
  }

  onSearch(searchTerm: string): void {
    this.searchTerm = searchTerm
    this.currentPage = 1
    this.loadProducts()
  }

  onSort(event: { column: string; direction: 0 | 1 }): void {
    this.sortColumn = event.column
    this.sortDirection = event.direction
    this.currentPage = 1
    console.log(event);
    
    this.loadProducts()
  }

  onPageChange(page: number): void {
    this.currentPage = page
    this.loadProducts()
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size
    this.currentPage = 1
    this.loadProducts()
  }

  onRowClick(product: Product): void {
    this.viewDetails(product)
  }

  onActionClick(event: { action: string; item: Product }): void {
    switch (event.action) {
      case "view":
        this.viewDetails(event.item)
        break
      case "edit":
        this.openEditModal(event.item)
        break
      case "duplicate":
        this.duplicateProduct(event.item)
        break
      case "delete":
        this.openDeleteConfirm(event.item)
        break
    }
  }

  onViewModeChange(mode: "table" | "grid"): void {
    this.viewMode = mode
  }

  toggleFilter(filterType: string): void {
    this.activeFilter = this.activeFilter === filterType ? null : filterType
  }

  onStatusFilterChange(status: string): void {
    this.statusFilter = status
    this.activeFilter = null
    this.currentPage = 1
    this.loadProducts()
  }

  onCategoryFilterChange(category: string): void {
    this.categoryFilter = category
    this.activeFilter = null
    this.currentPage = 1
    this.loadProducts()
  }

  // Modal management
  openAddModal(): void {
    this.editingProduct = null
    this.isModalOpen = true
  }

  openEditModal(product: Product): void {
    this.editingProduct = { ...product }
    this.isModalOpen = true
  }

  closeModal(): void {
    this.isModalOpen = false
  }

  saveProduct(productData: any): void {
    if (this.editingProduct) {
      // Update existing product
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
        })
        .subscribe({
          next: () => {
            this.loadProducts()
            this.closeModal()
          },
          error: (error) => {
            console.error("Error updating product:", error)
          },
        })
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
            this.loadProducts()
            this.closeModal()
          },
          error: (error) => {
            console.error("Error creating product:", error)
          },
        })
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
          this.loadProducts()
        },
        error: (error) => {
          console.error("Error duplicating product:", error)
        },
      })
  }

  // Delete management
  openDeleteConfirm(product: Product): void {
    this.deleteConfirm = {
      isOpen: true,
      productId: product.id,
    }
  }

  closeDeleteConfirm(): void {
    this.deleteConfirm = {
      isOpen: false,
      productId: null,
    }
  }

  confirmDelete(): void {
    if (this.deleteConfirm.productId) {
      this.productService.deleteProduct(this.deleteConfirm.productId).subscribe({
        next: () => {
          this.loadProducts()
          this.closeDeleteConfirm()
        },
        error: (error) => {
          console.error("Error deleting product:", error)
          this.closeDeleteConfirm()
        },
      })
    }
  }

  // Details modal
  viewDetails(product: Product): void {
    this.selectedProduct = { ...product }
    this.isDetailsModalOpen = true
  }

  closeDetailsModal(): void {
    this.isDetailsModalOpen = false
    this.selectedProduct = null
  }

  openEditModalFromDetails(product: Product): void {
    this.editingProduct = { ...product }
    this.isModalOpen = true
  }

  openDeleteConfirmFromDetails(product: Product): void {
    this.deleteConfirm = {
      isOpen: true,
      productId: product.id,
    }
  }
}
