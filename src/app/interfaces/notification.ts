export interface Notification {
  id: string
  type: "success" | "error" | "warning" | "info"
  title: string
  message: string
  duration?: number // in milliseconds, 0 means persistent
  action?: NotificationAction
  timestamp: Date
}

export interface NotificationAction {
  label: string
  handler: () => void
}

export interface NotificationConfig {
  type: "success" | "error" | "warning" | "info"
  title: string
  message: string
  duration?: number
  action?: NotificationAction
}
