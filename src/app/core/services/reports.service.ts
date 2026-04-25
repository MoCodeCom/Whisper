import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { Report, ReportStatus } from "../models/report.model";

@Injectable({ providedIn: "root" })
export class ReportsService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/cp/reports`;

  list(status?: ReportStatus) {
    let p = new HttpParams();
    if (status) p = p.set("status", status);
    return this.http.get<{ data: Report[]; total: number; page: number; limit: number }>(this.base, { params: p });
  }
  updateStatus(id: string, status: ReportStatus) {
    return this.http.put<{ message: string }>(`${this.base}/${id}`, { status });
  }
}
