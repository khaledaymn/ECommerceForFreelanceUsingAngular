
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataTableComponent, TableColumn, TableAction } from '../../../components/data-table/data-table.component';
import { UserService} from '../../../services/user.service';
import { Router } from '@angular/router';
import { User, UsersResponse, UsersFilter  } from '../../../interfaces/user.interface';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, DataTableComponent],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnInit {
  columns: TableColumn[] = [
   
    { key: 'fName', title: 'الاسم الأول', sortable: true, width: '15%' },
    { key: 'lName', title: 'الاسم الأخير', sortable: true, width: '15%' },
    { key: 'email', title: 'البريد الإلكتروني', sortable: true, width: '30%' },
    { key: 'phoneNumber', title: 'رقم الهاتف', sortable: true, width: '15%' },
  ];

  actions: TableAction[] = [
    { label: 'عرض التفاصيل', icon: 'visibility', action: 'view' },
    { label: 'تعديل', icon: 'edit', action: 'edit' },
    { label: 'حذف', icon: 'delete', action: 'delete', type: 'danger' },
  ];

  users = signal<User[]>([]);
  totalItems = signal<number>(0);
  currentPage = signal<number>(1);
  pageSize = signal<number>(10);
  pageSizeOptions = [5, 10, 25, 50];
  loading = signal<boolean>(false);
  filter = signal<UsersFilter>({
    pageIndex: 1,
    pageSize: 10,
    search: '',
    sortProp: undefined,
    sortDirection: undefined,
    isDeleted: false,
  });

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading.set(true);
    const currentFilter = this.filter();
    this.userService.getUsers(currentFilter).subscribe({
      next: (response: UsersResponse) => {
        this.users.set(response.data);
        this.totalItems.set(response.totalCount);
        this.pageSize.set(response.pageSize);
        this.currentPage.set(response.pageIndex );
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error fetching users:', err);
        this.loading.set(false);
      },
    });
  }

  onSearch(searchTerm: string) {
    this.filter.update((f) => ({ ...f, search: searchTerm, pageIndex: 1 }));
    this.loadUsers();
  }

  onSort(event: { column: string; direction: 0 | 1 }) {
    const sortPropMap: { [key: string]: number } = {
      id: 0,
      fName: 1,
      lName: 2,
      email: 3,
      phoneNumber: 4,
      address: 5,
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

  onActionClick(event: { action: string; item: User }) {
    switch (event.action) {
      case 'view':
        this.router.navigate(['/users', event.item.id]);
        break;
      case 'edit':
        this.editUser(event.item);
        break;
      case 'delete':
        if (confirm(`هل أنت متأكد من حذف المستخدم ${event.item.email}؟`)) {
          this.deleteUser(event.item.id);
        }
        break;
    }
  }

  editUser(user: User) {
    const newEmail = prompt('أدخل البريد الإلكتروني الجديد:', user.email);
    if (newEmail && newEmail !== user.email) {
      this.userService.updateUser(user.id, { email: newEmail }).subscribe({
        next: () => {
          this.loadUsers();
          alert('تم تحديث بيانات المستخدم بنجاح');
        },
        error: (err) => {
          console.error('Error updating user:', err);
          alert('فشل تحديث بيانات المستخدم');
        },
      });
    }
  }

  deleteUser(userId: string) {
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

  onFilterIsDeleted(isDeleted: boolean | undefined) {
    this.filter.update((f) => ({ ...f, isDeleted: isDeleted ?? false, pageIndex: 1 }));
    this.loadUsers();
  }
  totalPages(): number {
  if (!this.totalItems || !this.pageSize) {
    return 1;
  }
  // If totalItems and pageSize are functions, call them
  const total = typeof this.totalItems === 'function' ? this.totalItems() : this.totalItems;
  const size = typeof this.pageSize === 'function' ? this.pageSize() : this.pageSize;
  return Math.ceil(total / size) || 1;
}
}
