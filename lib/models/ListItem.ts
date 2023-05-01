import pool from '../../sql/pool.js';
import { InsertionError, UpdateError } from '../types/errorTypes.js';
import { ListItemFromDatabase, ListItemRows, ListItemUpdateData, NewListItemData } from '../types/listItemTypes.js';

export class ListItem {
  id: string;
  item: string;
  listId: string;
  bought: boolean;
  quantity: number | null;

  constructor(row: ListItemFromDatabase) {
    this.id = row.id;
    this.item = row.item;
    this.listId = row.list_id;
    this.bought = row.bought;
    this.quantity = row.quantity;
  }

  static async create({ listId, quantity, item }: NewListItemData): Promise<ListItem> {

    const { rows }: ListItemRows = await pool.query(
      `INSERT INTO list_items (list_id, quantity, item)
      VALUES ($1, $2, $3)
      RETURNING *`,
      [listId, quantity, item]
    );

    if (!rows[0]) throw new InsertionError('list_items');
    return new ListItem(rows[0]);
  }

  async update(data: ListItemUpdateData): Promise<ListItem> {

    const query = `UPDATE list_items SET
    ${Object.entries(data).map(([k, v]) => `${k} = ${v}`).join(', ')}
    WHERE id = $1
    RETURNING *`;

    const { rows }: ListItemRows = await pool.query(query, [this.id]);
    
    if (!rows[0]) throw new UpdateError('list_items');
    return new ListItem(rows[0]);
  }

  static async findById(id: string): Promise<ListItem | null> {

    const { rows }: ListItemRows = await pool.query(
      `SELECT * FROM list_items
      WHERE id = $1`,
      [id]
    );

    if (!rows[0]) return null;
    return new ListItem(rows[0]);
  }

  async delete(): Promise<ListItem> {

    const { rows }: ListItemRows = await pool.query(
      `DELETE FROM list_items
      WHERE id = $1
      RETURNING *`,
      [this.id]
    );

    if (!rows[0]) throw new Error('error');
    return new ListItem(rows[0]);
  }

  async getOwnerId(): Promise<string> {

    const { rows } = await pool.query(
      `SELECT lists.owner_id AS owner_id FROM list_items
      INNER JOIN lists ON lists.id = list_items.list_id
      WHERE list_items.id = $1`,
      [this.id]
    );

    return rows[0].owner_id;
  }
}
