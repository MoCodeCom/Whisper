import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { AppContent, AppContentKey } from "../models/app-content.model";

@Injectable({ providedIn: "root" })
export class AppContentService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/mobile/app-content`;

  get(key: AppContentKey) { return this.http.get<AppContent>(`${this.base}/${key}`); }
  update(key: AppContentKey, data: Partial<AppContent>) {
    return this.http.put<AppContent>(`${this.base}/${key}`, data);
  }
}
