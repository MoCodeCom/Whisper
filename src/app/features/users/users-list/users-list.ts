import { Component, inject, signal, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { FormsModule } from "@angular/forms";
import { UsersService } from "../../../core/services/users.service";
import { User } from "../../../core/models/user.model";
import { Badge, BadgeVariant } from "../../../shared/components/badge/badge";
import { ConfirmDialog } from "../../../shared/components/confirm-dialog/confirm-dialog";
import { Topbar } from "../../../shared/components/topbar/topbar";
import { TimeAgoPipe } from "../../../shared/pipes/time-ago-pipe";

@Component({
  selector: "app-users-list",
  imports: [FormsModule, Badge, ConfirmDialog, Topbar, TimeAgoPipe],
  templateUrl: "./users-list.html",
  styleUrl: "./users-list.css",
})
export class UsersList implements OnInit {
  private svc = inject(UsersService);
  users   = signal<User[]>([]);
  total   = signal(0);
  loading = signal(true);
  error   = signal("");
  search  = signal("");
  page    = signal(1);
  limit   = 20;
  confirm = signal<{ action: string; user: User } | null>(null);

  // Create admin modal
  showCreate  = signal(false);
  createError = signal("");
  creating    = signal(false);
  form = { name: "", phone: "", password: "", role: "admin" };

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.svc.list(this.page(), this.limit, this.search()).subscribe({
      next : r => { this.users.set(r.data); this.total.set(r.total); this.loading.set(false); },
      error: () => { this.error.set("Failed to load users."); this.loading.set(false); },
    });
  }

  onSearch() { this.page.set(1); this.load(); }
  prev() { if (this.page() > 1) { this.page.update(p => p - 1); this.load(); } }
  next() { if (this.page() * this.limit < this.total()) { this.page.update(p => p + 1); this.load(); } }

  ask(action: string, user: User) { this.confirm.set({ action, user }); }
  cancelConfirm()                 { this.confirm.set(null); }

  doConfirm() {
    const c = this.confirm(); if (!c) return; this.confirm.set(null);
    const obs: Observable<unknown> = c.action === "ban"   ? this.svc.ban(c.user.id)
              : c.action === "unban" ? this.svc.unban(c.user.id)
              :                        this.svc.remove(c.user.id);
    obs.subscribe({ next: () => this.load(), error: () => this.error.set("Action failed.") });
  }

  openCreate() {
    this.form = { name: "", phone: "", password: "", role: "admin" };
    this.createError.set("");
    this.showCreate.set(true);
  }

  submitCreate() {
    if (!this.form.name.trim() || !this.form.phone.trim() || !this.form.password.trim()) {
      this.createError.set("All fields are required."); return;
    }
    this.creating.set(true);
    this.svc.createAdmin(this.form).subscribe({
      next: () => { this.showCreate.set(false); this.creating.set(false); this.load(); },
      error: (e) => {
        this.createError.set(e?.error?.message || "Failed to create admin.");
        this.creating.set(false);
      },
    });
  }

  badge(role: string): BadgeVariant {
    return role === "banned" ? "danger" : role === "superadmin" ? "info" : role === "admin" ? "warning" : "neutral";
  }
  get pages() { return Math.ceil(this.total() / this.limit) || 1; }
}
