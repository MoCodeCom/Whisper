import { Component, inject, signal, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { RouterLink } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { GroupsService } from "../../../core/services/groups.service";
import { Group } from "../../../core/models/group.model";
import { Badge, BadgeVariant } from "../../../shared/components/badge/badge";
import { ConfirmDialog } from "../../../shared/components/confirm-dialog/confirm-dialog";
import { Topbar } from "../../../shared/components/topbar/topbar";
import { TimeAgoPipe } from "../../../shared/pipes/time-ago-pipe";

@Component({
  selector: "app-groups-list",
  imports: [RouterLink, FormsModule, Badge, ConfirmDialog, Topbar, TimeAgoPipe],
  templateUrl: "./groups-list.html",
  styleUrl: "./groups-list.css",
})
export class GroupsList implements OnInit {
  private svc = inject(GroupsService);
  groups  = signal<Group[]>([]);
  total   = signal(0);
  loading = signal(true);
  error   = signal("");
  search  = signal("");
  page    = signal(1);
  limit   = 20;
  confirm = signal<{ action: string; group: Group } | null>(null);

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.svc.list(this.page(), this.limit, this.search()).subscribe({
      next : r => { this.groups.set(r.data); this.total.set(r.total); this.loading.set(false); },
      error: () => { this.error.set("Failed to load groups."); this.loading.set(false); },
    });
  }

  onSearch() { this.page.set(1); this.load(); }
  prev() { if (this.page() > 1) { this.page.update(p => p - 1); this.load(); } }
  next() { if (this.page() * this.limit < this.total()) { this.page.update(p => p + 1); this.load(); } }

  ask(action: string, group: Group) { this.confirm.set({ action, group }); }
  cancelConfirm() { this.confirm.set(null); }

  doConfirm() {
    const c = this.confirm(); if (!c) return; this.confirm.set(null);
    const obs: Observable<unknown> = c.action === "ban"   ? this.svc.ban(c.group.id)
              : c.action === "unban" ? this.svc.unban(c.group.id)
              :                        this.svc.remove(c.group.id);
    obs.subscribe({ next: () => this.load(), error: () => this.error.set("Action failed.") });
  }

  statusBadge(g: Group): BadgeVariant { return g.is_active ? "success" : "danger"; }
  get pages() { return Math.ceil(this.total() / this.limit) || 1; }
}
