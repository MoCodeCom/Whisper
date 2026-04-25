import { Component, inject, signal, OnInit, input } from "@angular/core";
import { Observable } from "rxjs";
import { Router, RouterLink } from "@angular/router";
import { GroupsService } from "../../../core/services/groups.service";
import { Group } from "../../../core/models/group.model";
import { Badge, BadgeVariant } from "../../../shared/components/badge/badge";
import { ConfirmDialog } from "../../../shared/components/confirm-dialog/confirm-dialog";
import { Topbar } from "../../../shared/components/topbar/topbar";
import { TimeAgoPipe } from "../../../shared/pipes/time-ago-pipe";

@Component({
  selector: "app-groups-detail",
  imports: [RouterLink, Badge, ConfirmDialog, Topbar, TimeAgoPipe],
  templateUrl: "./groups-detail.html",
  styleUrl: "./groups-detail.css",
})
export class GroupsDetail implements OnInit {
  private svc    = inject(GroupsService);
  private router = inject(Router);
  id      = input.required<string>();
  group   = signal<Group | null>(null);
  loading = signal(true);
  error   = signal("");
  confirm = signal<string | null>(null);

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.svc.get(this.id()).subscribe({
      next : g => { this.group.set(g); this.loading.set(false); },
      error: () => { this.error.set("Group not found."); this.loading.set(false); },
    });
  }

  ask(action: string) { this.confirm.set(action); }
  cancelConfirm()     { this.confirm.set(null); }

  doConfirm() {
    const c = this.confirm(); if (!c) return; this.confirm.set(null);
    const obs: Observable<unknown> = c === "ban"    ? this.svc.ban(this.id())
              : c === "unban"  ? this.svc.unban(this.id())
              :                   this.svc.remove(this.id());
    obs.subscribe({
      next : () => { if (c === "delete") this.router.navigate(["/groups"]); else this.load(); },
      error: () => this.error.set("Action failed."),
    });
  }

  memberBadge(role: string): BadgeVariant { return role === "admin" ? "warning" : "neutral"; }
  statusBadge(g: Group): BadgeVariant     { return g.is_active ? "success" : "danger"; }
}
