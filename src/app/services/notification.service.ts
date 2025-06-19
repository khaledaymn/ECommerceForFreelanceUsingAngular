import { Injectable } from "@angular/core"
import { BehaviorSubject, type Observable } from "rxjs"
import { Notification, NotificationConfig } from "../interfaces/notification"

@Injectable({
  providedIn: "root",
})
export class NotificationService {
  private notifications$ = new BehaviorSubject<Notification[]>([])
  private readonly defaultDurations = {
    success: 4000,
    error: 6000,
    warning: 5000,
    info: 4000,
  }

  constructor() {}

  getNotifications(): Observable<Notification[]> {
    return this.notifications$.asObservable()
  }

  show(config: NotificationConfig): string {
    const notification: Notification = {
      id: this.generateId(),
      type: config.type,
      title: config.title,
      message: config.message,
      duration: config.duration ?? this.defaultDurations[config.type],
      action: config.action,
      timestamp: new Date(),
    }

    const currentNotifications = this.notifications$.value
    this.notifications$.next([notification, ...currentNotifications])

    // Auto-remove notification after duration (if not persistent)
    if ((notification.duration ?? 0) > 0) {
      setTimeout(() => {
        this.remove(notification.id)
      }, notification.duration!)
    }

    return notification.id
  }

  success(title: string, message: string, duration?: number): string {
    return this.show({
      type: "success",
      title,
      message,
      duration,
    })
  }

  error(title: string, message: string, duration?: number): string {
    return this.show({
      type: "error",
      title,
      message,
      duration,
    })
  }

  warning(title: string, message: string, duration?: number): string {
    return this.show({
      type: "warning",
      title,
      message,
      duration,
    })
  }

  info(title: string, message: string, duration?: number): string {
    return this.show({
      type: "info",
      title,
      message,
      duration,
    })
  }

  remove(id: string): void {
    const currentNotifications = this.notifications$.value
    const updatedNotifications = currentNotifications.filter((n) => n.id !== id)
    this.notifications$.next(updatedNotifications)
  }

  clear(): void {
    this.notifications$.next([])
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
  }
}
