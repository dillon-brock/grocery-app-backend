export type CategoryFromDB = {
  id: string;
  user_id: string | null;
  name: string;
}

export type NewCategoryData = {
  name: string;
  userId: string;
}
