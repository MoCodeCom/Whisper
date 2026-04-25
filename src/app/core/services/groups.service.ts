import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { Group, GroupsResponse } from "../models/group.model";

@Injectable({ providedIn: "root" })
export class GroupsService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/cp/groups`;

  list(page = 1, limit = 20, search = "") {
    let p = new HttpParams().set("page", page).set("limit", limit);
    if (search) p = p.set("search", search);
    return this.http.get<GroupsResponse>(this.base, { params: p });
  }
  get(id: string)    { return this.http.get<Group>(`${this.base}/${id}`);                         }
  ban(id: string)    { return this.http.put<{ message: string }>(`${this.base}/${id}/ban`,   {}); }
  unban(id: string)  { return this.http.put<{ message: string }>(`${this.base}/${id}/unban`, {}); }
  remove(id: string) { return this.http.delete<{ message: string }>(`${this.base}/${id}`);        }
}
