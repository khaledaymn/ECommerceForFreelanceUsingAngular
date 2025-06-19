import { Component, type OnInit, type OnDestroy } from "@angular/core"
import { CommonModule } from "@angular/common"
import { Subject, takeUntil } from "rxjs"
import { NotificationCardComponent } from "../notification-card/notification-card.component"
import { Notification } from "../../../interfaces/notification"
import { NotificationService } from "../../../services/notification.service"

@Component({
  selector: "app-notification-container",
  standalone: true,
  imports: [CommonModule, NotificationCardComponent],
  templateUrl: "./notification-container.component.html",
  styleUrls: ["./notification-container.component.scss"],
})
export class NotificationContainerComponent implements OnInit, OnDestroy {
  notifications: Notification[] = []
  private destroy$ = new Subject<void>()

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.notificationService
      .getNotifications()
      .pipe(takeUntil(this.destroy$))
      .subscribe((notifications) => {
        this.notifications = notifications
      })
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  onNotificationClose(id: string): void {
    this.notificationService.remove(id)
  }

  onActionClick(): void {
    // Handle action click if needed
  }

  trackByNotification(index: number, notification: Notification): string {
    return notification.id
  }
}
