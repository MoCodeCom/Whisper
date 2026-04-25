export interface Rating {
  id        : string;
  rater_id  : string;
  rated_id  : string | null;
  score     : number;
  comment   : string | null;
  created_at: string;
  updated_at: string;
  rater?    : { id: string; name: string; phone?: string } | null;
  rated?    : { id: string; name: string } | null;
}
