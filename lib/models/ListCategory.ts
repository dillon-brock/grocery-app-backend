import pool from '../../sql/pool.js';
import { InsertionError } from '../types/error.js';
import { Rows } from '../types/global.js';
import { ListCategoryFromDatabase, NewListCategoryData } from '../types/listCategory.js';

export class ListCategory {
  id: string;
  listId: string;
  categoryId: string;

  constructor(row: ListCategoryFromDatabase) {
    this.id = row.id;
    this.listId = row.list_id;
    this.categoryId = row.category_id;
  }

  static async create({ listId, categoryId }: NewListCategoryData) : Promise<ListCategory> {

    const { rows }: Rows<ListCategoryFromDatabase> = await pool.query(
      `INSERT INTO lists_categories (list_id, category_id)
      VALUES ($1, $2)
      RETURNING *`,
      [listId, categoryId]
    );

    if (!rows[0]) throw new InsertionError('lists_categories');
    return new ListCategory(rows[0]);
  }
}
