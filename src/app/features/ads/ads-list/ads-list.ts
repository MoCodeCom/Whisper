import { Component, inject, signal, OnInit } from "@angular/core";
import { RouterLink } from "@angular/router";
import { AdsService } from "../../../core/services/ads.service";
import { Ad } from "../../../core/models/ad.model";
import { Badge } from "../../../shared/components/badge/badge";
import { ConfirmDialog } from "../../../shared/components/confirm-dialog/confirm-dialog";
import { Topbar } from "../../../shared/components/topbar/topbar";

@Component({
  selector: "app-ads-list",
  imports: [RouterLink, Badge, ConfirmDialog, Topbar],
  templateUrl: "./ads-list.html",
  styleUrl: "./ads-list.css",
})
export class AdsList implements OnInit {
  private svc = inject(AdsService);
  ads     = signal<Ad[]>([]);
  loading = signal(true);
  error   = signal("");
  delTarget = signal<Ad | null>(null);

  ngOnInit() { this.load(); }
  load() {
    this.loading.set(true);
    this.svc.list().subscribe({
      next : r => { this.ads.set(r.ads); this.loading.set(false); },
      error: () => { this.error.set("Failed to load ads."); this.loading.set(false); },
    });
  }
  toggle(ad: Ad) { this.svc.toggle(ad.id).subscribe({ next: () => this.load(), error: () => this.error.set("Toggle failed.") }); }
  askDel(ad: Ad) { this.delTarget.set(ad); }
  cancelDel()    { this.delTarget.set(null); }
  doDel() {
    const ad = this.delTarget(); if (!ad) return; this.delTarget.set(null);
    this.svc.remove(ad.id).subscribe({ next: () => this.load(), error: () => this.error.set("Delete failed.") });
  }
}
