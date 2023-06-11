import pool from '../../sql/pool.js';
import { InsertionError } from '../types/error.js';
import { Permissions, Rows } from '../types/global.js';
import { CreateMealPlanParams, MealPlanFromDB } from '../types/mealPlan.js';
import { PlanShareFromDB } from '../types/planShare.js';

export class MealPlan {
  id: string;
  ownerId: string;
  date: string;
  createdAt: string;
  updatedAt: string;

  constructor(row: MealPlanFromDB) {
    this.id = row.id;
    this.ownerId = row.owner_id;
    this.date = row.date;
    this.createdAt = row.created_at;
    this.updatedAt = row.updated_at;
  }

  static async create({ date, ownerId }: CreateMealPlanParams): Promise<MealPlan> {

    const { rows }: Rows<MealPlanFromDB> = await pool.query(
      `INSERT INTO meal_plans (owner_id, date)
      VALUES ($1, $2)
      RETURNING *`,
      [ownerId, date]
    );

    if (!rows[0]) throw new InsertionError('meal_plans');
    return new MealPlan(rows[0]);
  }

  static async findById(id: string): Promise<MealPlan | null> {

    const { rows }: Rows<MealPlanFromDB> = await pool.query(
      `SELECT * FROM meal_plans
      WHERE id = $1`,
      [id]
    );

    return rows[0] ? new MealPlan(rows[0]) : null;
  }

  async checkPermissions(userId: string): Promise<Permissions> {

    const { rows }: Rows<PlanShareFromDB> = await pool.query(
      `SELECT plan_shares.* FROM meal_plans
      INNER JOIN plan_shares ON plan_shares.plan_id = meal_plans.id
      WHERE meal_plans.id = $1 AND plan_shares.user_id = $2`,
      [this.id, userId]
    );

    return {
      view: !!rows[0],
      edit: rows[0] ? rows[0].editable : false
    };
  }
}
