import { Component, input } from "@angular/core";

@Component({
  selector: "app-stat-card",
  templateUrl: "./stat-card.html",
  styleUrl: "./stat-card.css",
})
export class StatCard {
  label = input.required<string>();
  value = input.required<string | number>();
  icon  = input("📊");
  color = input("#2563eb");
  sub   = input<string>("");
}
