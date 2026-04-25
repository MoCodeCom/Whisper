export type UserRole   = "user" | "admin" | "superadmin" | "banned";
export type UserGender = "male" | "female" | "other";

export interface User {
  id             : string;
  phone          : string;
  name           : string;
  avatar_url     : string | null;
  status         : string;
  language       : string;
  language_name  : string;
  gender         : UserGender;
  role           : UserRole;
  is_online      : boolean;
  last_seen      : string | null;
  created_at     : string;
  updated_at     : string;
}

export interface UsersResponse {
  data  : User[];
  total : number;
  page  : number;
  limit : number;
}
