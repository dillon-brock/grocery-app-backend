import { Rows } from './global.js';

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
