import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Order, OrderStatus } from '../../../interfaces/order.interface';
import { OrderStatusBadgeComponent } from '../order-status-badge/order-status-badge.component';
import { OrderService } from '../../../services/order.service';

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
    'Pending',
    'Processing',
    'Shipped',
    'Delivered',
    'Cancelled',
  ];

  constructor(private orderservice: OrderService) {}
  onClose(): void {
    this.close.emit();
  }

  onUpdateStatus(status: OrderStatus): void {
    // this.updateStatus.emit({ orderId: this.order.orderID, status })
    this.orderservice.updateOrderStatus(this.order.orderID, status).subscribe({
      next: () => {
        this.order.status = status;
        this.updateStatus.emit({ orderId: this.order.orderID, status });
      },
      error: (error) => {
        console.error('Error updating order status', error);
      },
    });
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
