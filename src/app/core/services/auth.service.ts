import { Injectable, inject, signal, computed, Signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { environment } from "../../../environments/environment";
import { tap } from "rxjs";

interface AdminUser { id: string; name: string; role: string; }

@Injectable({ providedIn: "root" })
export class AuthService {
  private http   = inject(HttpClient);
  private router = inject(Router);

  private _token = signal<string | null>(
    typeof localStorage !== "undefined" ? localStorage.getItem("cp_token") : null
  );
  private _admin = signal<AdminUser | null>(
    typeof localStorage !== "undefined" ? JSON.parse(localStorage.getItem("cp_admin") || "null") : null
  );

  readonly token      : Signal<string | null>    = this._token.asReadonly();
  readonly admin      : Signal<AdminUser | null> = this._admin.asReadonly();
  readonly isLoggedIn = computed(() => !!this._token());

  login(phone: string, password: string) {
    return this.http.post<{ token: string; user: AdminUser }>(
      `${environment.apiUrl}/cp/auth/login`, { phone, password }
    ).pipe(tap(res => {
      this._token.set(res.token);
      this._admin.set(res.user);
      localStorage.setItem("cp_token", res.token);
      localStorage.setItem("cp_admin", JSON.stringify(res.user));
    }));
  }

  logout() {
    this._token.set(null);
    this._admin.set(null);
    localStorage.removeItem("cp_token");
    localStorage.removeItem("cp_admin");
    this.router.navigate(["/login"]);
  }
}
