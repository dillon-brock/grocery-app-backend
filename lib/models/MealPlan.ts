import pool from '../../sql/pool.js';
import { InsertionError, UpdateError } from '../types/error.js';
import { Permissions, Rows } from '../types/global.js';
import { CoalescedRecipe, CreateMealPlanParams, MealPlanFromDB, MealPlanUpdateData, MealPlanWithRecipesFromDB } from '../types/mealPlan.js';
import { PlanShareFromDB } from '../types/planShare.js';
import { buildUpdateQuery } from '../utils.js';

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

  static async updateById(id: string, data: MealPlanUpdateData): Promise<MealPlan> {
    const query: string = buildUpdateQuery('meal_plans', data);

    const { rows }: Rows<MealPlanFromDB> = await pool.query(query, [id]);
    if (!rows[0]) {
      throw new UpdateError('meal_plans');
    }

    return new MealPlan(rows[0]);
  }
}

export class MealPlanWithRecipes extends MealPlan {
  recipes: CoalescedRecipe[];

  constructor(row: MealPlanWithRecipesFromDB) {
    super(row);
    this.recipes = row.recipes;
  }

  static async findByDate(date: string, userId: string): Promise<MealPlanWithRecipes | null> {

    const { rows }: Rows<MealPlanWithRecipesFromDB> = await pool.query(
      `SELECT meal_plans.*,
      COALESCE(
        json_agg(json_build_object(
          'id', recipes.id::text,
          'name', recipes.name,
          'meal', plans_recipes.meal
        ))
        FILTER (WHERE recipes.id IS NOT NULL), '[]'
      ) as recipes FROM meal_plans
      LEFT JOIN plans_recipes ON plans_recipes.plan_id = meal_plans.id
      LEFT JOIN recipes ON recipes.id = plans_recipes.recipe_id
      WHERE meal_plans.date = $1 AND meal_plans.owner_id = $2
      GROUP BY meal_plans.id`,
      [date, userId]
    );

    if (!rows[0]) return null;
    return new MealPlanWithRecipes(rows[0]);
  }

  static async findByDateRange(startDate: string, endDate: string, userId: string): Promise<Array<MealPlanWithRecipes>> {
    
    const { rows }: Rows<MealPlanWithRecipesFromDB> = await pool.query(
      `SELECT meal_plans.*,
      COALESCE(
        json_agg(json_build_object(
          'id', recipes.id::text,
          'name', recipes.name,
          'meal', plans_recipes.meal
        ))
        FILTER (WHERE recipes.id IS NOT NULL), '[]'
      ) as recipes FROM meal_plans
      LEFT JOIN plans_recipes ON plans_recipes.plan_id = meal_plans.id
      LEFT JOIN recipes ON recipes.id = plans_recipes.recipe_id
      WHERE meal_plans.owner_id = $1 AND meal_plans.date between $2 AND $3
      GROUP BY meal_plans.id`,
      [userId, startDate, endDate]
    );

    return rows.map(row => new MealPlanWithRecipes(row));
  }
}
