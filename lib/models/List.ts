import pool from '../../sql/pool.js';
import { DeletionError, InsertionError } from '../types/error.js';
import { CoalescedListItem } from '../types/listItem.js';
import { CreateListParams, ListFromDB, ListRows, ListWithItemsFromDB, ListWithItemsRows } from '../types/list.js';
import { ListShareRows } from '../types/userList.js';

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
  items: CoalescedListItem[];

  constructor(row: ListWithItemsFromDB) {
    const { id, owner_id, title, created_at, updated_at } = row;
    super({ id, owner_id, title, created_at, updated_at });
    this.items = row.items;
  }

  static async findById(id: string): Promise<ListWithItems | null> {

    const { rows }: ListWithItemsRows = await pool.query(
      `SELECT lists.*,
      COALESCE(
        json_agg(json_build_object(
          'id', list_items.id,
          'bought', list_items.bought,
          'quantity', list_items.quantity,
          'item', list_items.item
        )) FILTER (WHERE list_items.id IS NOT NULL), '[]'
      ) as items from lists
      LEFT JOIN list_items ON list_items.list_id = lists.id
      WHERE lists.id = $1
      GROUP BY lists.id`,
      [id]
    );

    if (!rows[0]) return null;
    else return new ListWithItems(rows[0]);
  }
}
