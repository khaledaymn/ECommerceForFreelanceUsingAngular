import { Component, Input, Output, EventEmitter, type OnInit, type OnDestroy } from "@angular/core"
import { CommonModule } from "@angular/common"
import { Notification } from "../../../interfaces/notification"

@Component({
  selector: "app-notification-card",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./notification-card.component.html",
  styleUrls: ["./notification-card.component.scss"],
})
export class NotificationCardComponent implements OnInit, OnDestroy {
  @Input() notification!: Notification
  @Output() close = new EventEmitter<string>()
  @Output() actionClick = new EventEmitter<void>()

  progress = 100
  private progressInterval?: number

  ngOnInit(): void {
    if ((this.notification.duration ?? 0) > 0) {
      this.startProgressBar()
    }
  }

  ngOnDestroy(): void {
    if (this.progressInterval) {
      clearInterval(this.progressInterval)
    }
  }

  onClose(): void {
    this.close.emit(this.notification.id)
  }

  onActionClick(): void {
    if (this.notification.action) {
      this.notification.action.handler()
      this.actionClick.emit()
    }
  }

  getIcon(): string {
    switch (this.notification.type) {
      case "success":
        return "check_circle"
      case "error":
        return "error"
      case "warning":
        return "warning"
      case "info":
        return "info"
      default:
        return "notifications"
    }
  }

  getTypeClass(): string {
    return `notification-${this.notification.type}`
  }

  private startProgressBar(): void {
    const duration = this.notification.duration ?? 3000 // Default to 3000ms if undefined
    const interval = 50 // Update every 50ms
    const decrement = (interval / duration) * 100

    this.progressInterval = window.setInterval(() => {
      this.progress -= decrement
      if (this.progress <= 0) {
        this.progress = 0
        if (this.progressInterval) {
          clearInterval(this.progressInterval)
        }
      }
    }, interval)
  }
}
