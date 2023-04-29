export interface ListFromDatabase {
  id: string;
  owner_id: string;
}

export interface ListRows {
  rows: ListFromDatabase[];
}
