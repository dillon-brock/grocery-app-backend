import pool from '../../sql/pool.js';
import { ErrorWithStatus, InsertionError, UpdateError } from '../types/error.js';
import { ListItemFromDB, ListItemRows, ListItemUpdateData, NewListItemData, OwnerIDRows } from '../types/listItem.js';

export class ListItem {
  id: string;
  item: string;
  listId: string;
  bought: boolean;
  quantity: string | null;
  categoryId: string | null;

  constructor(row: ListItemFromDB) {
    this.id = row.id;
    this.item = row.item;
    this.listId = row.list_id;
    this.bought = row.bought;
    this.quantity = row.quantity;
    this.categoryId = row.category_id;
  }

  static async create({ listId, quantity, item, categoryId }: NewListItemData): Promise<ListItem> {

    const { rows }: ListItemRows = await pool.query(
      `INSERT INTO list_items (list_id, quantity, item, category_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *`,
      [listId, quantity, item, categoryId]
    );

    if (!rows[0]) throw new InsertionError('list_items');
    return new ListItem(rows[0]);
  }

  static async createMultiple(items: NewListItemData[]): Promise<ListItem[]> {

    if (!items[0]) return [];

    let query = 'INSERT INTO list_items (list_id, quantity, item, category_id) VALUES ';
    const values: string[] = [];

    for (let i = 0; i < items.length; i++) {
      const item: NewListItemData | undefined = items[i];
      if (!item) throw new Error('Invalid data structure');

      const rowValues = [
        item.listId,
        item.quantity,
        item.item,
        item.categoryId
      ];

      let row = '(';
      for (let j = 1; j <= 4; j++) {
        row += `$${j + (i * 4)}`;
      }
      row += i == items.length - 1 ? ') ' : '), ';
      query += row;

      values.push(...rowValues);
    }

    query += 'RETURNING *';

    const { rows }: ListItemRows = await pool.query(query, values);
    return rows.map(row => new ListItem(row));
  }

  async update(data: ListItemUpdateData): Promise<ListItem> {

    const query = `UPDATE list_items SET
    ${Object.entries(data)
    .map(([k, v]) => {
      let newVal: string = `${v}`;
      if (typeof v == 'string') {
        newVal = `'${v}'`;
      }
      return `${k} = ` + newVal;
    }).join(', ')}
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

    const { rows }: OwnerIDRows = await pool.query(
      `SELECT lists.owner_id AS owner_id FROM list_items
      INNER JOIN lists ON lists.id = list_items.list_id
      WHERE list_items.id = $1`,
      [this.id]
    );

    if (!rows[0]) throw new ErrorWithStatus('Could not get list information', 500);
    return rows[0].owner_id;
  }
}
