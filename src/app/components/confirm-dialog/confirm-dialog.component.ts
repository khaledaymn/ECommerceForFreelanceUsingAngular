import { Component, Input, Output, EventEmitter } from "@angular/core"
import { CommonModule } from "@angular/common"

@Component({
  selector: "app-confirm-dialog",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./confirm-dialog.component.html",
  styleUrls: ["./confirm-dialog.component.scss"],
})
export class ConfirmDialogComponent {
  @Input() isOpen = false
  @Input() title = ""
  @Input() description = ""
  @Output() close = new EventEmitter<void>()
  @Output() confirm = new EventEmitter<void>()

  onClose(): void {
    this.close.emit()
  }

  onConfirm(): void {
    this.confirm.emit()
  }
}
