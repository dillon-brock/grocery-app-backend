import pool from '../../sql/pool.js';
import { InsertionError } from '../types/errorTypes.js';
import { ListItemFromDatabase, ListItemRows, NewListItemData } from '../types/listItemTypes.js';

export class ListItem {
  id: string;
  listId: string;
  bought: boolean;
  quantity: number | null;

  constructor(row: ListItemFromDatabase) {
    this.id = row.id;
    this.listId = row.list_id;
    this.bought = row.bought;
    this.quantity = row.quantity;
  }

  static async create({ listId, quantity }: NewListItemData): Promise<ListItem> {

    const { rows }: ListItemRows = await pool.query(
      `INSERT INTO list_items (list_id, quantity)
      VALUES ($1, $2)
      RETURNING *`,
      [listId, quantity]
    );

    if (!rows[0]) throw new InsertionError('list_items');
    return new ListItem(rows[0]);
  }
}
