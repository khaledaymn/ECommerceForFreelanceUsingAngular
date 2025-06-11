import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ConfirmDialogComponent } from "../../components/confirm-dialog/confirm-dialog.component";

@Component({
  selector: "app-settings",
  standalone: true,
  imports: [CommonModule, ConfirmDialogComponent],
  templateUrl: "./settings.component.html",
  styleUrls: ["./settings.component.scss"],
})
export class SettingsComponent {
  isConfirmDialogOpen: boolean = true;

}
