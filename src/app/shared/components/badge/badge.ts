import { Component, input } from "@angular/core";

export type BadgeVariant = "success" | "danger" | "warning" | "info" | "neutral";

@Component({
  selector: "app-badge",
  template: `<span class="badge" [class]="'badge-' + variant()"><ng-content /></span>`,
  styles: [`
    .badge { display:inline-flex;align-items:center;padding:3px 9px;border-radius:999px;font-size:11.5px;font-weight:600;white-space:nowrap; }
    .badge-success { background:var(--success-bg); color:var(--success); }
    .badge-danger  { background:var(--danger-bg);  color:var(--danger);  }
    .badge-warning { background:var(--warning-bg); color:var(--warning); }
    .badge-info    { background:var(--info-bg);    color:var(--info);    }
    .badge-neutral { background:var(--bg); color:var(--text-light); border:1px solid var(--border); }
  `],
})
export class Badge {
  variant = input<BadgeVariant>("neutral");
}
