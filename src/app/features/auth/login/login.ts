import { Component, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { AuthService } from "../../../core/services/auth.service";

@Component({
  selector: "app-login",
  imports: [FormsModule],
  templateUrl: "./login.html",
  styleUrl: "./login.css",
})
export class Login {
  private auth   = inject(AuthService);
  private router = inject(Router);

  phone    = signal("");
  password = signal("");
  loading  = signal(false);
  error    = signal("");

  submit() {
    if (!this.phone() || !this.password()) { this.error.set("Enter phone and password."); return; }
    this.loading.set(true); this.error.set("");
    this.auth.login(this.phone(), this.password()).subscribe({
      next : () => this.router.navigate(["/"]),
      error: (e) => { this.error.set(e?.error?.message || "Invalid credentials."); this.loading.set(false); },
    });
  }
}
