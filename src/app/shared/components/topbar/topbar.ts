import { Component, input } from "@angular/core";

@Component({
  selector: "app-topbar",
  templateUrl: "./topbar.html",
  styleUrl: "./topbar.css",
})
export class Topbar {
  title    = input("Dashboard");
  subtitle = input("");
  readonly today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}
