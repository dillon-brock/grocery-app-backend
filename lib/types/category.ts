import { Rows, SucessResponse } from './global.js';

export type CategoryRows = Rows<CategoryFromDB>

export type CategoryFromDB = {
  id: string;
  list_id: string;
  name: string;
}

export type NewCategoryData = {
  name: string;
  listId: string;
}

export type CategoryUpdateData = {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  listId: string;
}

// response types:
export interface CategoryRes extends SucessResponse {
  category: Category;
}
