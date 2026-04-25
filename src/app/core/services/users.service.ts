import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { User, UsersResponse } from "../models/user.model";

@Injectable({ providedIn: "root" })
export class UsersService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/cp/users`;

  list(page = 1, limit = 20, search = "") {
    let p = new HttpParams().set("page", page).set("limit", limit);
    if (search) p = p.set("search", search);
    return this.http.get<UsersResponse>(this.base, { params: p });
  }
  ban(id: string)    { return this.http.put<{ message: string }>(`${this.base}/${id}/ban`,   {}); }
  unban(id: string)  { return this.http.put<{ message: string }>(`${this.base}/${id}/unban`, {}); }
  remove(id: string) { return this.http.delete<{ message: string }>(`${this.base}/${id}`);        }
  createAdmin(data: { name: string; phone: string; password: string; role: string }) {
    return this.http.post<{ message: string; id: string }>(this.base, data);
  }
}
