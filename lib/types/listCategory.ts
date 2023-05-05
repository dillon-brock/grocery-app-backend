export type ListCategoryFromDatabase = {
  id: string;
  list_id: string;
  category_id: string;
}

export type ListCategoryRows = {
  rows: ListCategoryFromDatabase[];
}

export type NewListCategoryData = {
  listId: string;
  categoryId: string;
}
