import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Order, OrderStatus } from '../../../interfaces/order.interface';
import { OrderStatusBadgeComponent } from '../order-status-badge/order-status-badge.component';
import { OrderService } from '../../../services/order.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [CommonModule, OrderStatusBadgeComponent],
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.scss'],
})
export class OrderDetailsComponent {
  @Input() order!: Order;
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  @Output() updateStatus = new EventEmitter<{
    orderId: number;
    status: OrderStatus;
  }>();

  statusOptions: OrderStatus[] = [
    'طلب جديد',
    'تحت الاجراء',
    'تم انهاء الطلب',
    'الغاء الطلب',
  ];

  constructor(
    private orderservice: OrderService,
    private notification: NotificationService
  ) {}
  onClose(): void {
    this.close.emit();
  }

  onUpdateStatus(status: OrderStatus): void {
    // this.updateStatus.emit({ orderId: this.order.orderID, status })
    this.orderservice.updateOrderStatus(this.order.id, status).subscribe({
      next: () => {
        this.order.status = status;
        this.updateStatus.emit({ orderId: this.order.id, status });
        this.notification.success('نجاح', ' تم تحديث حالة الطلب');
      },
      error: (error) => {
        console.error('Error updating order status', error);
      },
    });
  }
  getStatusClass(status: string): string {
    switch (status) {
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
        return status.toLowerCase();
    }
  }
  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('ar', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
