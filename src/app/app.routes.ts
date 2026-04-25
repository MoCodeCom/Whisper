import { Routes } from "@angular/router";
import { authGuard } from "./core/guards/auth-guard";

export const routes: Routes = [
  { path: "login", loadComponent: () => import("./features/auth/login/login").then(m => m.Login) },
  {
    path: "",
    loadComponent: () => import("./layout/layout").then(m => m.Layout),
    canActivate: [authGuard],
    children: [
      { path: "",              redirectTo: "dashboard", pathMatch: "full" },
      { path: "dashboard",    loadComponent: () => import("./features/dashboard/dashboard").then(m => m.Dashboard)                              },
      { path: "users",        loadComponent: () => import("./features/users/users-list/users-list").then(m => m.UsersList)                      },
      { path: "users/:id",    loadComponent: () => import("./features/users/users-detail/users-detail").then(m => m.UsersDetail)                },
      { path: "groups",       loadComponent: () => import("./features/groups/groups-list/groups-list").then(m => m.GroupsList)                  },
      { path: "groups/:id",   loadComponent: () => import("./features/groups/groups-detail/groups-detail").then(m => m.GroupsDetail)            },
      { path: "reports",      loadComponent: () => import("./features/reports/reports-list/reports-list").then(m => m.ReportsList)              },
      { path: "ads",          loadComponent: () => import("./features/ads/ads-list/ads-list").then(m => m.AdsList)                              },
      { path: "ads/new",      loadComponent: () => import("./features/ads/ads-form/ads-form").then(m => m.AdsForm)                              },
      { path: "ads/:id/edit", loadComponent: () => import("./features/ads/ads-form/ads-form").then(m => m.AdsForm)                              },
      { path: "ratings",      loadComponent: () => import("./features/ratings/ratings-list/ratings-list").then(m => m.RatingsList)              },
      { path: "app-content",  loadComponent: () => import("./features/app-content/app-content/app-content").then(m => m.AppContentPage)        },
    ],
  },
  { path: "**", redirectTo: "" },
];
