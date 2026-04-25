import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { Ad, AdFormData } from "../models/ad.model";

@Injectable({ providedIn: "root" })
export class AdsService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/cp/ads`;

  list()             { return this.http.get<{ ads: Ad[]; total: number }>(this.base); }
  get(id: string)    { return this.http.get<Ad>(`${this.base}/${id}`);                }
  toggle(id: string) { return this.http.patch<Ad>(`${this.base}/${id}/toggle`, {});   }
  remove(id: string) { return this.http.delete<void>(`${this.base}/${id}`);           }
  create(d: AdFormData)             { return this.http.post<Ad>(this.base,                    this.toForm(d)); }
  update(id: string, d: AdFormData) { return this.http.put<Ad>(`${this.base}/${id}`, this.toForm(d)); }

  private toForm(d: AdFormData): FormData {
    const fd = new FormData();
    fd.append("title",       d.title);
    fd.append("description", d.description || "");
    fd.append("link_url",    d.link_url    || "");
    fd.append("link_label",  d.link_label  || "Learn More");
    fd.append("is_active",   String(d.is_active));
    fd.append("sort_order",  String(d.sort_order));
    if (d.image) fd.append("image", d.image);
    return fd;
  }
}
