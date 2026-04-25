import { Component, inject, signal, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { DatePipe } from "@angular/common";
import { AppContentService } from "../../../core/services/app-content.service";
import { AppContent as AppContentItem, AppContentKey } from "../../../core/models/app-content.model";
import { Topbar } from "../../../shared/components/topbar/topbar";

type Tab = AppContentKey;

@Component({
  selector: "app-app-content",
  imports: [FormsModule, DatePipe, Topbar],
  templateUrl: "./app-content.html",
  styleUrl: "./app-content.css",
})
export class AppContentPage implements OnInit {
  private svc = inject(AppContentService);

  tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "about",       label: "About Wisber",  icon: "ℹ️"  },
    { key: "privacy",     label: "Privacy Policy", icon: "🔒" },
    { key: "app-version", label: "App Version",    icon: "📱" },
  ];

  activeTab = signal<Tab>("about");

  data: Record<Tab, AppContentItem> = {
    "about"      : { key: "about",       title: "", body: "", version: null, updatedAt: "" },
    "privacy"    : { key: "privacy",     title: "", body: "", version: null, updatedAt: "" },
    "app-version": { key: "app-version", title: "", body: "", version: null, updatedAt: "" },
  };

  loadingMap = signal<Record<Tab, boolean>>({ "about": true, "privacy": true, "app-version": true });
  saving  = signal(false);
  error   = signal("");
  success = signal("");

  ngOnInit() { this.tabs.forEach(t => this.loadTab(t.key)); }

  loadTab(key: Tab) {
    this.svc.get(key).subscribe({
      next : c => { this.data[key] = c; this.loadingMap.update(m => ({ ...m, [key]: false })); },
      error: () => {                    this.loadingMap.update(m => ({ ...m, [key]: false })); },
    });
  }

  setTab(key: Tab) { this.activeTab.set(key); this.error.set(""); this.success.set(""); }

  save() {
    const key = this.activeTab();
    const item = this.data[key];
    if (!item.title.trim()) { this.error.set("Title is required."); return; }
    this.saving.set(true); this.error.set(""); this.success.set("");
    this.svc.update(key, { title: item.title, body: item.body, version: item.version }).subscribe({
      next : u => { this.data[key] = u; this.saving.set(false); this.success.set("Saved successfully!"); },
      error: e => { this.error.set(e?.error?.message || "Save failed."); this.saving.set(false); },
    });
  }
}
