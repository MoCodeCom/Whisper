import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { Rating } from "../models/rating.model";

@Injectable({ providedIn: "root" })
export class RatingsService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/cp/ratings`;

  list(page = 1, limit = 20) {
    const p = new HttpParams().set("page", page).set("limit", limit);
    return this.http.get<{ data: Rating[]; total: number; page: number; limit: number }>(this.base, { params: p });
  }
  remove(id: string) { return this.http.delete<{ message: string }>(`${this.base}/${id}`); }
}
