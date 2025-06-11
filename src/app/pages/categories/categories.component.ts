import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { CategoryService } from "../../services/category.service"
import { Category, CategoryParams } from "../../interfaces/category"
import { DataTableComponent, TableAction, TableColumn } from "../../components/data-table/data-table.component"
import { CategoryModalComponent } from "./modals/category-modal/category-modal.component"
import { ConfirmDialogComponent } from "../../components/confirm-dialog/confirm-dialog.component"
import { CategoryDetailsModalComponent } from "./modals/category-details-modal/category-details-modal.component"

@Component({
  selector: "app-category",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DataTableComponent,
    CategoryModalComponent,
    ConfirmDialogComponent,
    CategoryDetailsModalComponent,
  ],
  templateUrl: "./categories.component.html",
  styleUrls: ["./categories.component.scss"],
})
export class CategoryManagementComponent implements OnInit {
  // Data
  categories: Category[] = []
  filteredCategories: Category[] = []
  loading = false

  // Pagination
  currentPage = 1
  pageSize = 10
  totalPages = 1
  totalItems = 0

  // Sorting and filtering
  searchTerm = ""
  sortColumn = "name"
  sortDirection: 0 | 1 = 0

  // Modal state
  isModalOpen = false
  isDetailsModalOpen = false
  editingCategory: Category | null = null
  selectedCategory: Category | null = null
  deleteConfirm: { isOpen: boolean; categoryId: number | null } = {
    isOpen: false,
    categoryId: null,
  }

  // Table configuration
  columns: TableColumn[] = [
    { key: "imageThumbnailURL", title: "الصورة", type: "image", width: "20%", align: "center" },
    { key: "name", title: "اسم الفئة", sortable: true, width: "10%" },
    { key: "description", title: "الوصف", width: "50%" },
  ]

  actions: TableAction[] = [
    { label: "عرض", icon: "visibility", action: "view" },
    { label: "تعديل", icon: "edit", action: "edit" },
    { label: "حذف", icon: "delete", action: "delete", type: "danger" },
  ]

  viewMode: "table" | "grid" = "table"

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.loadCategories()
  }

  loadCategories(): void {
    this.loading = true

    const params: CategoryParams = {
      pageIndex: this.currentPage,
      pageSize: this.pageSize,
      search: this.searchTerm,
      sortProp: this.sortColumn as any,
      sortDirection: (this.sortDirection as import("../../interfaces/category").SortDirection) || 0,
    }

    this.categoryService.getAllCategories(params).subscribe({
      next: (response) => {
        this.categories = response.data
        this.filteredCategories = response.data
        this.totalItems = response.totalCount
        this.totalPages = Math.ceil(response.totalCount / this.pageSize)
        this.loading = false
        // Ensure imageThumbnailURL is set if missing
        this.filteredCategories = this.filteredCategories.map(category => {
          if (!category.imageThumbnailURL && category.imageURL) {
            return { ...category, imageThumbnailURL: category.imageURL }
          }
          return category
        })
        // this.filteredCategories.forEach((data)=> console.log(data));
      },
      error: (error) => {
        console.error("Error loading categories:", error)
        this.loading = false
      },
    })
  }

  onSearch(searchTerm: string): void {
    this.searchTerm = searchTerm
    this.currentPage = 1
    this.loadCategories()
  }

  onSort(event: { column: string; direction: 0 | 1 }): void {
    this.sortColumn = event.column
    this.sortDirection = event.direction
    this.currentPage = 1
    this.loadCategories()
  }

  onPageChange(page: number): void {
    this.currentPage = page
    this.loadCategories()
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size
    this.currentPage = 1
    this.loadCategories()
  }

  onRowClick(category: Category): void {
    this.viewDetails(category)
  }

  onActionClick(event: { action: string; item: Category }): void {
    switch (event.action) {
      case "view":
        this.viewDetails(event.item)
        break
      case "edit":
        this.openEditModal(event.item)
        break
      case "delete":
        this.openDeleteConfirm(event.item)
        break
    }
  }

  onViewModeChange(mode: "table" | "grid"): void {
    this.viewMode = mode
  }

  // Modal management
  openAddModal(): void {
    this.editingCategory = null
    this.isModalOpen = true
  }

  openEditModal(category: Category): void {
    this.editingCategory = { ...category }
    this.isModalOpen = true
  }

  closeModal(): void {
    this.isModalOpen = false
  }

  saveCategory(categoryData: any): void {
    if (this.editingCategory) {
      // Update existing category
      this.categoryService
        .updateCategory({
          id: this.editingCategory.id,
          name: categoryData.name,
          description: categoryData.description,
          image: categoryData.image,
        })
        .subscribe({
          next: () => {
            this.loadCategories()
            this.closeModal()
          },
          error: (error) => {
            console.error("Error updating category:", error)
          },
        })
    } else {
      // Create new category
      this.categoryService
        .createCategory({
          name: categoryData.name,
          description: categoryData.description,
          image: categoryData.image,
        })
        .subscribe({
          next: () => {
            this.loadCategories()
            this.closeModal()
          },
          error: (error) => {
            console.error("Error creating category:", error)
          },
        })
    }
  }

  // Delete management
  openDeleteConfirm(category: Category): void {
    this.deleteConfirm = {
      isOpen: true,
      categoryId: category.id,
    }
  }

  closeDeleteConfirm(): void {
    this.deleteConfirm = {
      isOpen: false,
      categoryId: null,
    }
  }

  confirmDelete(): void {
    if (this.deleteConfirm.categoryId) {
      this.categoryService.deleteCategory(this.deleteConfirm.categoryId).subscribe({
        next: () => {
          this.loadCategories()
          this.closeDeleteConfirm()
        },
        error: (error) => {
          console.error("Error deleting category:", error)
          this.closeDeleteConfirm()
        },
      })
    }
  }
  getCategoryName(){
    if (this.deleteConfirm.categoryId) {
    const category = this.categories.find(cat => cat.id === this.deleteConfirm.categoryId);
    return category?.name ?? '';
    }
    return '';
  }
  // Details modal
  viewDetails(category: Category): void {
    this.selectedCategory = { ...category }
    this.isDetailsModalOpen = true
  }

  closeDetailsModal(): void {
    this.isDetailsModalOpen = false
    this.selectedCategory = null
  }

  openEditModalFromDetails(category: Category): void {
    this.editingCategory = { ...category }
    this.isModalOpen = true
  }

  openDeleteConfirmFromDetails(category: Category): void {
    this.deleteConfirm = {
      isOpen: true,
      categoryId: category.id,
    }
  }
}
