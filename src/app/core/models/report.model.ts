export type ReportStatus = "pending" | "reviewed" | "dismissed";

export interface Report {
  id         : string;
  reporter_id: string;
  reported_id: string;
  reason     : string;
  status     : ReportStatus;
  created_at : string;
  reporter?  : { id: string; name: string; phone: string; avatar_url: string | null };
  reported?  : { id: string; name: string; phone: string; avatar_url: string | null };
}
