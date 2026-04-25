import { Component, inject, signal, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { StatCard } from "../../shared/components/stat-card/stat-card";
import { Topbar } from "../../shared/components/topbar/topbar";
import { TimeAgoPipe } from "../../shared/pipes/time-ago-pipe";

interface DashboardStats {
  users      : { total: number; online: number };
  reports    : { pending: number };
  ratings    : { total: number; average: string };
  recentUsers: { id: string; name: string; phone: string; created_at: string }[];
}

@Component({
  selector: "app-dashboard",
  imports: [StatCard, Topbar, TimeAgoPipe],
  templateUrl: "./dashboard.html",
  styleUrl: "./dashboard.css",
})
export class Dashboard implements OnInit {
  private http = inject(HttpClient);
  stats   = signal<DashboardStats | null>(null);
  loading = signal(true);
  error   = signal("");

  ngOnInit() {
    this.http.get<DashboardStats>(`${environment.apiUrl}/cp/dashboard/stats`).subscribe({
      next : s => { this.stats.set(s);                        this.loading.set(false); },
      error: () => { this.error.set("Failed to load stats."); this.loading.set(false); },
    });
  }
}
