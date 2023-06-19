import pool from '../../sql/pool.js';
import { DeletionError, InsertionError, UpdateError } from '../types/error.js';
import { Rows } from '../types/global.js';
import { NewPlanShareData, PlanShareFromDB, PlanShareUpdateData } from '../types/planShare.js';
import { UserRows } from '../types/user.js';
import { buildUpdateQuery } from '../utils.js';
import { PublicUser } from './User.js';

export class PlanShare {
  id: string;
  planId: string;
  userId: string;
  editable: boolean;

  constructor(row: PlanShareFromDB) {
    this.id = row.id;
    this.userId = row.user_id;
    this.planId = row.plan_id;
    this.editable = row.editable;
  }

  static async create({ planId, userId, editable }: NewPlanShareData): Promise<PlanShare> {

    const { rows }: Rows<PlanShareFromDB> = await pool.query(
      `INSERT INTO plan_shares (plan_id, user_id, editable)
      VALUES ($1, $2, $3)
      RETURNING *`,
      [planId, userId, editable]
    );

    if (!rows[0]) {
      throw new InsertionError('plan_shares');
    }
    return new PlanShare(rows[0]);
  }

  static async findById(id: string): Promise<PlanShare | null> {

    const { rows }: Rows<PlanShareFromDB> = await pool.query(
      `SELECT * FROM plan_shares
      WHERE id = $1`,
      [id]
    );

    return rows[0] ? new PlanShare(rows[0]) : null;
  }

  static async updateById(id: string, data: PlanShareUpdateData): Promise<PlanShare> {
    const query = buildUpdateQuery('plan_shares', data);
    const { rows }: Rows<PlanShareFromDB> = await pool.query(query, [id]);

    if (!rows[0]) {
      throw new UpdateError('plan_shares');
    }
    return new PlanShare(rows[0]);
  }

  static async getUsersByPlanId(planId: string): Promise<PublicUser[]> {
    const { rows }: UserRows = await pool.query(
      `SELECT users.id, users.username FROM plan_shares
      INNER JOIN users ON users.id = plan_shares.user_id
      WHERE plan_shares.plan_id = $1`,
      [planId]
    );

    return rows.map(row => new PublicUser(row));
  }

  static async deleteById(id: string): Promise<PlanShare> {
    const { rows }: Rows<PlanShareFromDB> = await pool.query(
      `DELETE FROM plan_shares
      WHERE id = $1
      RETURNING *`,
      [id]
    );

    if (!rows[0]) {
      throw new DeletionError('plan_shares');
    }
    return new PlanShare(rows[0]);
  }
}
