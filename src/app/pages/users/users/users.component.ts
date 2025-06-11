import {
  Component,
  HostListener,
  OnInit,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  DataTableComponent,
  TableColumn,
  TableAction,
} from '../../../components/data-table/data-table.component';
// import { UserService } from '../../../services/user.service';
import { Router } from '@angular/router';
import {
  User,
  UsersResponse,
  UsersFilter,
  UserDTO,
} from '../../../interfaces/user.interface';
// import { UserDetailsComponent } from './user-details/user-details.component';
import { ConfirmDialogComponent } from '../../../components/confirm-dialog/confirm-dialog.component';
import { UserEditModalComponent } from './user-edit-modal/user-edit-modal.component';
import { UserDetailsComponent } from './users-details/users-details.component';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DataTableComponent,
    UserDetailsComponent,
    UserEditModalComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnInit {
  columns: TableColumn[] = [
    { key: 'fName', title: 'الاسم الأول', sortable: true, width: '15%' },
    { key: 'lName', title: 'الاسم الأخير', sortable: true, width: '15%' },
    { key: 'email', title: 'البريد الإلكتروني', sortable: true, width: '20%' },
    { key: 'phoneNumber', title: 'رقم الهاتف', sortable: true, width: '15%' },
    // { key: 'isBlocked', title: 'حالة الحظر', type: 'boolean', sortable: true, width: '10%' },
    {
      key: 'isDeleted',
      title: 'الحالة',
      type: 'boolean',
      sortable: true,
      width: '10%',
    },
  ];
  // type boolean
  actions: TableAction[] = [
    { label: 'عرض التفاصيل', icon: 'visibility', action: 'view' },
    { label: 'تعديل', icon: 'edit', action: 'edit' },
    { label: 'حظر/إلغاء الحظر', icon: 'block', action: 'toggleBlock' },
    { label: 'حذف', icon: 'delete', action: 'delete', type: 'danger' },
  ];

  users = signal<User[]>([]);
  totalItems = signal<number>(0);
  currentPage = signal<number>(1);
  pageSize = signal<number>(10);
  totalPages = computed(
    () => Math.ceil(this.totalItems() / this.pageSize()) || 1
  );
  pageSizeOptions = [5, 10, 25, 50];
  loading = signal<boolean>(false);
  filter = signal<UsersFilter>({
    pageIndex: 1,
    pageSize: 10,
    search: '',
    sortProp: undefined,
    sortDirection: undefined,
    isDeleted: undefined,
    isBlocked: undefined,
  });

  viewMode: 'table' | 'grid' = 'table';
  isDetailsModalOpen = false;
  isEditModalOpen = false;
  selectedUser: User | null = null;
  editingUser: User | null = null;
  confirmDialog: {
    isOpen: boolean;
    userId: string | null;
    title: string;
    description: string;
    action: 'delete' | 'toggleBlock' | null;
  } = {
    isOpen: false,
    userId: null,
    title: '',
    description: '',
    action: null,
  };

  // Filter state
  showFilters = false;
  activeDropdown = '';
  isDeletedFilter: boolean | undefined = undefined;
  isBlockedFilter: boolean | undefined = undefined;
  isDeletedSearchTerm = '';
  isBlockedSearchTerm = '';

  private isDeletedOptions = [
    { value: false, label: 'غير محظور' },
    { value: true, label: 'محظور' },
  ];

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit() {
    this.loadUsers();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.status-filter')) {
      this.activeDropdown = '';
    }
  }

  loadUsers() {
    this.loading.set(true);
    const currentFilter = this.filter();
    this.userService.getUsers(currentFilter).subscribe({
      next: (response: UsersResponse) => {
        this.users.set(response.data);
        this.totalItems.set(response.totalCount);
        this.pageSize.set(response.pageSize);
        this.currentPage.set(response.pageIndex || 1);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error fetching users:', err);
        this.loading.set(false);
        alert('فشل في جلب المستخدمين');
      },
    });
  }

  onSearch(searchTerm: string) {
    this.filter.update((f) => ({ ...f, search: searchTerm, pageIndex: 1 }));
    this.loadUsers();
  }

  onViewModeChange(viewMode: 'table' | 'grid'): void {
    this.viewMode = viewMode;
  }

  onSort(event: { column: string; direction: 0 | 1 }) {
    const sortPropMap: { [key: string]: number } = {
      id: 0,
      fName: 1,
      lName: 2,
      email: 3,
      phoneNumber: 4,
      isBlocked: 5,
      isDeleted: 6,
    };
    this.filter.update((f) => ({
      ...f,
      sortProp: sortPropMap[event.column],
      sortDirection: event.direction,
      pageIndex: 1,
    }));
    this.loadUsers();
  }

  onPageChange(page: number) {
    this.filter.update((f) => ({ ...f, pageIndex: page }));
    this.loadUsers();
  }

  onPageSizeChange(size: number) {
    this.filter.update((f) => ({ ...f, pageSize: size, pageIndex: 1 }));
    this.loadUsers();
  }

  onRowClick(user: User): void {
    this.viewDetails(user);
  }

  onActionClick(event: { action: string; item: User }) {
    switch (event.action) {
      case 'view':
        this.viewDetails(event.item);
        break;
      case 'edit':
        this.openEditModal(event.item);
        break;
      case 'toggleBlock':
        this.openToggleBlockDialog(event.item);
        break;
      case 'delete':
        this.openDeleteConfirm(event.item);
        break;
    }
  }

  viewDetails(user: User): void {
    this.userService.getUserById(user.id).subscribe({
      next: (userData) => {
        this.selectedUser = userData;
        this.isDetailsModalOpen = true;
      },
      error: (err) => {
        console.error('Error fetching user details:', err);
        alert('فشل في جلب تفاصيل المستخدم');
      },
    });
  }

  closeDetailsModal(): void {
    this.isDetailsModalOpen = false;
    this.selectedUser = null;
  }

  openEditModal(user: User | undefined): void {
    this.editingUser = user ? { ...user } : null;
    this.isEditModalOpen = true;
  }

  closeEditModal(): void {
    this.isEditModalOpen = false;
    this.editingUser = null;
  }

  saveUser(user: UserDTO): void {
    if (!this.editingUser) return;

    this.userService.updateUser(user.id, user).subscribe({
      next: () => {
        this.loadUsers();
        this.closeEditModal();
        alert('تم تحديث بيانات المستخدم بنجاح');
      },
      error: (err) => {
        console.error('Error updating user:', err);
        alert('فشل تحديث بيانات المستخدم');
      },
    });
  }

  openDeleteConfirm(user: User): void {
    this.confirmDialog = {
      isOpen: true,
      userId: user.id,
      title: 'تأكيد حذف المستخدم',
      description: `هل أنت متأكد من حذف المستخدم ${user.email}؟ لا يمكن التراجع عن هذا الإجراء.`,
      action: 'delete',
    };
  }

  openToggleBlockDialog(user: User): void {
    const isBlocked = user.isDeleted ?? false;
    this.confirmDialog = {
      isOpen: true,
      userId: user.id,
      title: isBlocked ? 'إلغاء حظر المستخدم' : 'حظر المستخدم',
      description: `هل أنت متأكد من ${
        isBlocked ? 'إلغاء حظر' : 'حظر'
      } المستخدم ${user.email}؟`,
      action: 'toggleBlock',
    };
  }

  closeConfirmDialog(): void {
    this.confirmDialog = {
      isOpen: false,
      userId: null,
      title: '',
      description: '',
      action: null,
    };
  }

  // Handle confirm dialog action
  confirmAction($event: string | number | void): string | number | null {
    // your logic here
    if ($event === null || $event === undefined) {
      this.closeConfirmDialog();
      return null;
    }

    if ($event === undefined) {
      return null;
    }
    return $event;
  }

  deleteUser(userId: string): void {
    this.userService.deleteUser(userId).subscribe({
      next: () => {
        this.loadUsers();
        alert('تم حذف المستخدم بنجاح');
      },
      error: (err) => {
        console.error('Error deleting user:', err);
        alert('فشل حذف المستخدم');
      },
    });
  }

  toggleBlock(userId: string, isBlock: boolean): void {
    this.userService.toggleUserBlock(userId, isBlock).subscribe({
      next: () => {
        this.loadUsers();
        alert(`تم ${isBlock ? 'حظر' : 'إلغاء حظر'} المستخدم بنجاح`);
      },
      error: (err) => {
        console.error('Error toggling user block:', err);
        alert(`فشل في ${isBlock ? 'حظر' : 'إلغاء حظر'} المستخدم`);
      },
    });
  }

  // Filter methods
  toggleFilters(): void {
    this.showFilters = !this.showFilters;
    if (!this.showFilters) {
      this.activeDropdown = '';
    }
  }

  closeFilters(): void {
    this.showFilters = false;
    this.activeDropdown = '';
  }

  toggleDropdown(dropdown: string): void {
    this.activeDropdown = this.activeDropdown === dropdown ? '' : dropdown;
  }

  selectIsDeleted(value: boolean | undefined): void {
    this.onIsDeletedFilterChange(value);
    this.activeDropdown = '';
  }

  onIsDeletedFilterChange(value: boolean | undefined): void {
    this.isDeletedFilter = value;
    this.filter.update((f) => ({ ...f, isDeleted: value, pageIndex: 1 }));
    this.loadUsers();
  }

  selectIsBlocked(value: boolean | undefined): void {
    this.onIsBlockedFilterChange(value);
    this.activeDropdown = '';
  }

  onIsBlockedFilterChange(value: boolean | undefined): void {
    this.isBlockedFilter = value;
    this.filter.update((f) => ({ ...f, isBlocked: value, pageIndex: 1 }));
    this.loadUsers();
  }

  getFilteredIsDeletedOptions() {
    if (!this.isDeletedSearchTerm) return this.isDeletedOptions;
    return this.isDeletedOptions.filter((option) =>
      option.label
        .toLowerCase()
        .includes(this.isDeletedSearchTerm.toLowerCase())
    );
  }

  getIsDeletedClass(isDeleted: boolean | undefined): string {
    if (isDeleted === undefined) return 'is-deleted-default';
    return isDeleted ? 'is-deleted-false' : 'is-deleted-true';
  }

  getActiveFiltersCount(): number {
    let count = 0;
    if (this.isDeletedFilter !== undefined) count++;
    if (this.isBlockedFilter !== undefined) count++;
    return count;
  }

  hasActiveFilters(): boolean {
    return (
      this.isDeletedFilter !== undefined || this.isBlockedFilter !== undefined
    );
  }

  clearFilters(): void {
    this.isDeletedFilter = undefined;
    this.isBlockedFilter = undefined;
    this.isDeletedSearchTerm = '';
    this.isBlockedSearchTerm = '';
    this.filter.update((f) => ({
      ...f,
      isDeleted: undefined,
      isBlocked: undefined,
      pageIndex: 1,
    }));
    this.loadUsers();
  }

  applyFilters(): void {
    this.closeFilters();
    this.loadUsers();
  }
}
