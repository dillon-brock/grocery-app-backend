import pool from '../../sql/pool.js';
import { CategoryFromDB, NewCategoryData } from '../types/category.js';
import { InsertionError } from '../types/error.js';
import { Rows } from '../types/global.js';

export class Category {
  id: string;
  name: string;
  userId: string | null;

  constructor(row: CategoryFromDB) {
    this.id = row.id;
    this.name = row.name;
    this.userId = row.user_id;
  }

  static async create({ name, userId }: NewCategoryData): Promise<Category> {

    const { rows }: Rows<CategoryFromDB> = await pool.query(
      `INSERT INTO categories (name, user_id)
      VALUES ($1, $2)
      RETURNING *`,
      [name, userId]
    );

    if (!rows[0]) throw new InsertionError('categories');
    return new Category(rows[0]);
  }
}
