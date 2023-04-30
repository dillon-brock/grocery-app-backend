import pool from '../../sql/pool.js';
import { InsertionError } from '../types/errorTypes.js';
import { ListItemFromDatabase, ListItemRows, NewListItemData } from '../types/listItemTypes.js';

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
}
