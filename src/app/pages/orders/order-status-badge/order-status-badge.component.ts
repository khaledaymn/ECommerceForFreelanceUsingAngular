import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderStatus } from '../../../interfaces/order.interface';

@Component({
  selector: 'app-order-status-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-status-badge.component.html',
  styleUrls: ['./order-status-badge.component.scss'],
})
export class OrderStatusBadgeComponent {
  @Input() status!: OrderStatus | string;
  statusOptions: OrderStatus[] = [
    'طلب جديد',
    'تحت الاجراء',
    'تم انهاء الطلب',
    'الغاء الطلب',
  ];
  getStatusClass(): string {
    switch (this.status) {
      // Example cases, replace with your actual OrderStatus values
      case this.statusOptions[0]:
        return 'pending';
      case this.statusOptions[1]:
        return 'shipped';
      case this.statusOptions[2]:
        return 'delivered';
      case this.statusOptions[3]:
        return 'cancelled';
      default:
        return this.status.toLowerCase();
    }
  }
}
