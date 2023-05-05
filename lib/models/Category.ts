import pool from '../../sql/pool.js';
import { CategoryFromDB, NewCategoryData } from '../types/category.js';
import { InsertionError } from '../types/error.js';
import { Rows } from '../types/global.js';

export class Category {
  id: string;
  name: string;
  listId: string | null;

  constructor(row: CategoryFromDB) {
    this.id = row.id;
    this.name = row.name;
    this.listId = row.list_id;
  }

  static async create({ name, listId }: NewCategoryData): Promise<Category> {

    const { rows }: Rows<CategoryFromDB> = await pool.query(
      `INSERT INTO categories (name, list_id)
      VALUES ($1, $2)
      RETURNING *`,
      [name, listId]
    );

    if (!rows[0]) throw new InsertionError('categories');
    return new Category(rows[0]);
  }
}
