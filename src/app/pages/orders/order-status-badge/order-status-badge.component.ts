import { Component, Input } from "@angular/core"
import { CommonModule } from "@angular/common"
import  { OrderStatus } from "../../../interfaces/order.interface"

@Component({
  selector: "app-order-status-badge",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./order-status-badge.component.html",
  styleUrls: ["./order-status-badge.component.scss"],
})
export class OrderStatusBadgeComponent {
  @Input() status!: OrderStatus

  getStatusClass(): string {
    return this.status.toLowerCase()
  }
}
