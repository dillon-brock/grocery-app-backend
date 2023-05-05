import pool from '../../sql/pool.js';
import { CategoryFromDB, CategoryRows, CategoryUpdateData, NewCategoryData } from '../types/category.js';
import { InsertionError, UpdateError } from '../types/error.js';

export class Category {
  id: string;
  name: string;
  listId: string;

  constructor(row: CategoryFromDB) {
    this.id = row.id;
    this.name = row.name;
    this.listId = row.list_id;
  }

  static async create({ name, listId }: NewCategoryData): Promise<Category> {

    const { rows }: CategoryRows = await pool.query(
      `INSERT INTO categories (name, list_id)
      VALUES ($1, $2)
      RETURNING *`,
      [name, listId]
    );

    if (!rows[0]) throw new InsertionError('categories');
    return new Category(rows[0]);
  }


  static async findById(id: string): Promise<Category | null> {
    
    const { rows }: CategoryRows = await pool.query(
      `SELECT * FROM categories
      WHERE id = $1`,
      [id]
    );

    if (!rows[0]) return null;
    return new Category(rows[0]);
  }

  static async updateNameById({ id, name }: CategoryUpdateData): Promise<Category> {

    const { rows }: CategoryRows = await pool.query(
      `UPDATE categories
      SET name = $1
      WHERE id = $2
      RETURNING *`,
      [name, id]
    );

    if (!rows[0]) throw new UpdateError('categories');
    return new Category(rows[0]);
  }
}
