import pool from '../../sql/pool';
import { InsertionError } from '../types/errorTypes';
import { ListFromDatabase, ListRows } from '../types/listTypes';

export class List {
  id: string;
  ownerId: string;

  constructor(row: ListFromDatabase) {
    this.id = row.id;
    this.ownerId = row.owner_id;
  }

  static async create(ownerId: string): Promise<List> {

    const { rows }: ListRows = await pool.query(
      `INSERT INTO lists (owner_id)
      VALUES ($1)
      RETURNING *`,
      [ownerId]
    );

    if (!rows[0]) throw new InsertionError('lists');
    return new List(rows[0]);
  }
}
