import { Component, input, output } from "@angular/core";

@Component({
  selector: "app-confirm-dialog",
  templateUrl: "./confirm-dialog.html",
  styleUrl: "./confirm-dialog.css",
})
export class ConfirmDialog {
  title   = input("Confirm");
  message = input("Are you sure?");
  danger  = input(false);
  confirm = output<void>();
  cancel  = output<void>();
}
