import { Component, Input, Output, EventEmitter } from "@angular/core"
import { CommonModule } from "@angular/common"

@Component({
  selector: "app-view-toggle",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./view-toggle.component.html",
  styleUrls: ["./view-toggle.component.scss"],
})
export class ViewToggleComponent {
  @Input() viewMode: "table" | "grid" = "table"
  @Output() viewModeChange = new EventEmitter<"table" | "grid">()

  onViewModeChange(mode: "table" | "grid"): void {
    this.viewModeChange.emit(mode)
  }
}
