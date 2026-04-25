import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";
import { Topbar } from "../../../shared/components/topbar/topbar";

@Component({
  selector: "app-users-detail",
  imports: [RouterLink, Topbar],
  template: `
    <app-topbar title="User Detail" />
    <div class="card" style="max-width:500px">
      <p style="color:var(--text-light)">Select a user from the
        <a routerLink="/users" style="color:var(--primary)">Users list</a>.
      </p>
    </div>
  `,
})
export class UsersDetail {}
