import pool from '../../sql/pool.js';
import { DeletionError, InsertionError } from '../types/error.js';
import { CoalescedCategory, CreateListParams, ListFromDB, ListRows, ListWithItemsFromDB, ListWithItemsRows } from '../types/list.js';
import { ListShareRows } from '../types/listShare.js';

export class List {
  id: string;
  ownerId: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;

  constructor(row: ListFromDB) {
    this.id = row.id;
    this.ownerId = row.owner_id;
    this.title = row.title;
    this.createdAt = row.created_at;
    this.updatedAt = row.updated_at;
  }

  static async create({ title, ownerId }: CreateListParams): Promise<List> {

    const { rows }: ListRows = await pool.query(
      `INSERT INTO lists (title, owner_id)
      VALUES ($1, $2)
      RETURNING *`,
      [title, ownerId]
    );

    if (!rows[0]) throw new InsertionError('lists');
    return new List(rows[0]);
  }

  static async findById(id: string): Promise<List | null> {

    const { rows }: ListRows = await pool.query(
      `SELECT * FROM lists
      WHERE id = $1`, [id]
    );

    if (!rows[0]) return null;
    return new List(rows[0]);
  }

  static async findAllByOwnerId(ownerId: string): Promise<List[]> {
    
    const { rows }: ListRows = await pool.query(
      `SELECT * FROM lists
      WHERE owner_id = $1`,
      [ownerId]
    );

    return rows.map(row => new List(row));
  }

  async delete(): Promise<List> {

    await pool.query('DELETE FROM list_items WHERE list_id = $1', [this.id]);
    await pool.query('DELETE FROM categories WHERE list_id = $1', [this.id]);

    const { rows }: ListRows = await pool.query(
      `DELETE FROM lists
      WHERE id = $1
      RETURNING *`,
      [this.id]
    );

    if (!rows[0]) throw new DeletionError('lists');
    return new List(rows[0]);
  }

  async checkIfSharedWithUser(userId: string): Promise<boolean> {

    const { rows }: ListShareRows = await pool.query(
      `SELECT list_shares.* FROM lists
      INNER JOIN list_shares ON list_shares.list_id = lists.id
      WHERE lists.id = $1 AND list_shares.user_id = $2`,
      [this.id, userId]
    );

    if (!rows[0]) return false;
    return rows[0].editable;
  }

}


export class ListWithItems extends List {
  categories: CoalescedCategory[];

  constructor(row: ListWithItemsFromDB) {
    const { id, owner_id, title, created_at, updated_at } = row;
    super({ id, owner_id, title, created_at, updated_at });
    this.categories = row.categories;
  }

  static async findById(id: string): Promise<ListWithItems | null> {

    const { rows }: ListWithItemsRows = await pool.query(
      `SELECT lists.*,
      (
        SELECT jsonb_agg(nested_category)
        FROM (
          SELECT categories.id::text, categories.name,
          (
            SELECT json_agg(nested_item)
            FROM (
              SELECT
              list_items.id::text,
              list_items.item,
              list_items.quantity,
              list_items.bought,
              list_items.category_id::text AS "categoryId"
              FROM list_items
              WHERE list_items.category_id = categories.id
            ) AS nested_item
          ) AS items
          FROM categories
          WHERE categories.list_id = lists.id
        ) AS nested_category
      ) AS categories
      FROM lists
      WHERE lists.id = $1
      `,
      [id]
    );

    if (!rows[0]) return null;
    else return new ListWithItems(rows[0]);
  }
}
