import pool from '../../sql/pool.js';
import { InsertionError, UpdateError } from '../types/error.js';
import { Rows } from '../types/global.js';
import { NewPlanShareData, PlanShareFromDB, PlanShareUpdateData } from '../types/planShare.js';
import { buildUpdateQuery } from '../utils.js';

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

  static async updateById(id: string, data: PlanShareUpdateData): Promise<PlanShare> {
    const query = buildUpdateQuery('plan_shares', data);
    const { rows }: Rows<PlanShareFromDB> = await pool.query(query, [id]);

    if (!rows[0]) {
      throw new UpdateError('plan_shares');
    }
    return new PlanShare(rows[0]);
  }
}
