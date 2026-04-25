import { Component, inject, signal, OnInit, input } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { AdsService } from "../../../core/services/ads.service";
import { AdFormData } from "../../../core/models/ad.model";
import { Topbar } from "../../../shared/components/topbar/topbar";

@Component({
  selector: "app-ads-form",
  imports: [FormsModule, RouterLink, Topbar],
  templateUrl: "./ads-form.html",
  styleUrl: "./ads-form.css",
})
export class AdsForm implements OnInit {
  private svc    = inject(AdsService);
  private router = inject(Router);
  id = input<string | null>(null);

  form: AdFormData = { title: "", description: "", link_url: "", link_label: "Learn More", is_active: true, sort_order: 0, image: null };
  loading      = signal(false);
  saving       = signal(false);
  error        = signal("");
  imagePreview = signal<string | null>(null);
  get isEdit() { return !!this.id(); }

  ngOnInit() {
    if (!this.isEdit) return;
    this.loading.set(true);
    this.svc.get(this.id()!).subscribe({
      next : ad => {
        this.form = { title: ad.title, description: ad.description || "", link_url: ad.link_url || "",
                      link_label: ad.link_label, is_active: ad.is_active, sort_order: ad.sort_order, image: null };
        if (ad.image_url) this.imagePreview.set(ad.image_url);
        this.loading.set(false);
      },
      error: () => { this.error.set("Failed to load ad."); this.loading.set(false); },
    });
  }

  onImg(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0]; if (!file) return;
    this.form.image = file;
    const r = new FileReader(); r.onload = () => this.imagePreview.set(r.result as string); r.readAsDataURL(file);
  }

  save() {
    if (!this.form.title.trim()) { this.error.set("Title is required."); return; }
    this.saving.set(true); this.error.set("");
    const obs = this.isEdit ? this.svc.update(this.id()!, this.form) : this.svc.create(this.form);
    obs.subscribe({
      next : () => this.router.navigate(["/ads"]),
      error: e  => { this.error.set(e?.error?.message || "Save failed."); this.saving.set(false); },
    });
  }
}
