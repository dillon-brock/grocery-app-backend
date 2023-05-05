export type CategoryFromDatabase = {
  id: string;
  user_id: string | null;
  name: string;
}

export type CategoryRows = {
  rows: CategoryFromDatabase[];
}

export type NewCategoryData = {
  name: string;
  userId: string;
}
