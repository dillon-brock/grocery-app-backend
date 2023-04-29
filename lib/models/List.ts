import pool from '../../sql/pool.js';
import { InsertionError } from '../types/errorTypes.js';
import { ListFromDatabase, ListRows } from '../types/listTypes.js';

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

  static async findById(id: string): Promise<List | null> {

    const { rows }: ListRows = await pool.query(
      `SELECT * FROM lists
      WHERE id = $1`, [id]
    );

    if (!rows[0]) return null;
    return new List(rows[0]);
  }
}
