import { Component, inject, signal, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ReportsService } from "../../../core/services/reports.service";
import { Report, ReportStatus } from "../../../core/models/report.model";
import { Badge, BadgeVariant } from "../../../shared/components/badge/badge";
import { ConfirmDialog } from "../../../shared/components/confirm-dialog/confirm-dialog";
import { Topbar } from "../../../shared/components/topbar/topbar";
import { TimeAgoPipe } from "../../../shared/pipes/time-ago-pipe";

@Component({
  selector: "app-reports-list",
  imports: [FormsModule, Badge, ConfirmDialog, Topbar, TimeAgoPipe],
  templateUrl: "./reports-list.html",
  styleUrl: "./reports-list.css",
})
export class ReportsList implements OnInit {
  private svc = inject(ReportsService);
  reports = signal<Report[]>([]);
  total   = signal(0);
  loading = signal(true);
  error   = signal("");
  filter  = signal<ReportStatus | "">("");
  target  = signal<{ report: Report; status: ReportStatus } | null>(null);

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.svc.list(this.filter() || undefined).subscribe({
      next : r => { this.reports.set(r.data); this.total.set(r.total); this.loading.set(false); },
      error: () => { this.error.set("Failed to load reports.");            this.loading.set(false); },
    });
  }

  ask(report: Report, status: ReportStatus) { this.target.set({ report, status }); }
  cancel() { this.target.set(null); }
  doUpdate() {
    const t = this.target(); if (!t) return; this.target.set(null);
    this.svc.updateStatus(t.report.id, t.status).subscribe({
      next: () => this.load(), error: () => this.error.set("Update failed."),
    });
  }

  badge(s: ReportStatus): BadgeVariant {
    return s === "pending" ? "warning" : s === "reviewed" ? "success" : "neutral";
  }
}
