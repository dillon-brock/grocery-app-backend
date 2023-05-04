import pool from '../../sql/pool.js';
import { InsertionError } from '../types/error.js';
import { ListRows } from '../types/list.js';
import { UserRows } from '../types/user.js';
import { ListShareFromDatabase, ListShareRows, NewListShareData } from '../types/userList.js';
import { List } from './List.js';
import { User } from './User.js';

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

  static async findListsByUserId(userId: string): Promise<List[]> {

    const { rows }: ListRows = await pool.query(
      `SELECT lists.* FROM list_shares
      INNER JOIN lists ON lists.id = list_shares.list_id
      WHERE list_shares.user_id = $1`,
      [userId]
    );

    return rows.map(row => new List(row));
  }

  static async findUsersByListId(listId: string): Promise<User[]> {

    const { rows }: UserRows = await pool.query(
      `SELECT users.* FROM list_shares
      INNER JOIN users ON users.id = list_shares.user_id
      WHERE list_shares.list_id = $1`,
      [listId]
    );

    return rows.map(row => new User(row));
  }
}
