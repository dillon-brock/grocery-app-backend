import pool from '../../sql/pool.js';
import { InsertionError } from '../types/error.js';
import { Rows } from '../types/global.js';
import { CreateMealPlanParams, MealPlanFromDB } from '../types/mealPlan.js';

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
}
