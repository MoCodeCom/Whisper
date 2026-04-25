import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";

@Injectable({ providedIn: "root" })
export class ApiService {
  private http = inject(HttpClient);
  get cpBase()     { return `${environment.apiUrl}/cp`;     }
  get mobileBase() { return `${environment.apiUrl}/mobile`; }
}
