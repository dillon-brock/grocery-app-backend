export type CategoryFromDB = {
  id: string;
  list_id: string | null;
  name: string;
}

export type NewCategoryData = {
  name: string;
  listId: string;
}
