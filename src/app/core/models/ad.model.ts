export interface Ad {
  id         : string;
  title      : string;
  description: string | null;
  image_url  : string | null;
  link_url   : string | null;
  link_label : string;
  is_active  : boolean;
  sort_order : number;
  created_at : string;
  updated_at : string;
}

export interface AdFormData {
  title      : string;
  description: string;
  link_url   : string;
  link_label : string;
  is_active  : boolean;
  sort_order : number;
  image?     : File | null;
}
