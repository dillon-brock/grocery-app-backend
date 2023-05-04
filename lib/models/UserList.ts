import pool from '../../sql/pool.js';
import { InsertionError } from '../types/error.js';
import { NewUserListData, UserListFromDatabase, UserListRows } from '../types/userList.js';

export class UserList {
  id: string;
  userId: string;
  listId: string;

  constructor(row: UserListFromDatabase) {
    this.id = row.id;
    this.userId = row.user_id;
    this.listId = row.list_id;
  }

  static async create({ listId, userId }: NewUserListData) {

    const { rows }: UserListRows = await pool.query(
      `INSERT INTO users_lists (list_id, user_id)
      VALUES ($1, $2)
      RETURNING *`,
      [listId, userId]
    );

    if (!rows[0]) throw new InsertionError('users_lists');
    return new UserList(rows[0]);
  }
}
