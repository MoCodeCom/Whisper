import { Component, inject, signal, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { RatingsService } from "../../../core/services/ratings.service";
import { Rating } from "../../../core/models/rating.model";
import { ConfirmDialog } from "../../../shared/components/confirm-dialog/confirm-dialog";
import { Topbar } from "../../../shared/components/topbar/topbar";
import { TimeAgoPipe } from "../../../shared/pipes/time-ago-pipe";

@Component({
  selector: "app-ratings-list",
  imports: [Topbar, TimeAgoPipe, ConfirmDialog],
  templateUrl: "./ratings-list.html",
  styleUrl: "./ratings-list.css",
})
export class RatingsList implements OnInit {
  private svc   = inject(RatingsService);
  ratings       = signal<Rating[]>([]);
  total         = signal(0);
  loading       = signal(true);
  error         = signal("");
  page          = signal(1);
  limit         = 20;
  confirmId     = signal<string | null>(null);

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.svc.list(this.page(), this.limit).subscribe({
      next : r => { this.ratings.set(r.data); this.total.set(r.total); this.loading.set(false); },
      error: () => { this.error.set("Failed to load ratings."); this.loading.set(false); },
    });
  }

  prev() { if (this.page() > 1)                              { this.page.update(p => p - 1); this.load(); } }
  next() { if (this.page() * this.limit < this.total())      { this.page.update(p => p + 1); this.load(); } }
  get pages() { return Math.ceil(this.total() / this.limit) || 1; }

  askDelete(id: string) { this.confirmId.set(id); }
  cancelDelete()        { this.confirmId.set(null); }
  doDelete() {
    const id = this.confirmId(); if (!id) return; this.confirmId.set(null);
    (this.svc.remove(id) as Observable<unknown>).subscribe({
      next : () => this.load(),
      error: () => this.error.set("Delete failed."),
    });
  }

  stars(n: number) { return "★".repeat(Math.max(0, Math.min(5, n))) + "☆".repeat(5 - Math.max(0, Math.min(5, n))); }
}
