import pool from '../../sql/pool.js';
import { InsertionError } from '../types/error.js';
import { ListShareFromDatabase, ListShareRows, NewListShareData } from '../types/userList.js';

export class ListShare {
  id: string;
  userId: string;
  listId: string;
  editable: boolean;

  constructor(row: ListShareFromDatabase) {
    this.id = row.id;
    this.userId = row.user_id;
    this.listId = row.list_id;
    this.editable = row.editable;
  }

  static async create({ listId, userId, editable }: NewListShareData) {

    const { rows }: ListShareRows = await pool.query(
      `INSERT INTO list_shares (list_id, user_id, editable)
      VALUES ($1, $2, $3)
      RETURNING *`,
      [listId, userId, editable]
    );

    if (!rows[0]) throw new InsertionError('users_lists');
    return new ListShare(rows[0]);
  }
}
