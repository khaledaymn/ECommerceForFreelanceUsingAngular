import { Component, EventEmitter, Input, Output } from "@angular/core"
import { CommonModule } from "@angular/common"
import  { Order, OrderStatus } from "../../../interfaces/order.interface"
import { OrderStatusBadgeComponent } from "../order-status-badge/order-status-badge.component"

@Component({
  selector: "app-order-details",
  standalone: true,
  imports: [CommonModule, OrderStatusBadgeComponent],
  templateUrl: "./order-details.component.html",
  styleUrls: ["./order-details.component.scss"],
})
export class OrderDetailsComponent {
  @Input() order!: Order
  @Output() close = new EventEmitter<void>()
  @Output() updateStatus = new EventEmitter<{ orderId: number; status: OrderStatus }>()

  statusOptions: OrderStatus[] = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"]

  onClose(): void {
    this.close.emit()
  }

  onUpdateStatus(status: OrderStatus): void {
    this.updateStatus.emit({ orderId: this.order.orderID, status })
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString("ar", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }
}
