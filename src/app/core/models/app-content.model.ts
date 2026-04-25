export type AppContentKey = "about" | "privacy" | "app-version";

export interface AppContent {
  key      : AppContentKey;
  title    : string;
  body     : string;
  version  : string | null;
  updatedAt: string;
}
