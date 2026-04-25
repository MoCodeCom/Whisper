export interface GroupMember {
  userId: string;
  name  : string;
  avatar: string | null;
  phone : string | null;
  role  : "admin" | "member";
}

export interface Group {
  id        : string;
  name      : string;
  avatar    : string | null;
  status    : string;
  is_active : boolean;
  created_by: string;
  created_at: string;
  members   : GroupMember[];
}

export interface GroupsResponse {
  data  : Group[];
  total : number;
  page  : number;
  limit : number;
}
