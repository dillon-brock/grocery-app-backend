import pool from '../../sql/pool.js';
import { DeletionError, InsertionError, UpdateError } from '../types/error.js';
import { Permissions, Rows } from '../types/global.js';
import { NewPlanRecipeData, PlanRecipeFromDB, PlanRecipeUpdateData } from '../types/planRecipe.js';
import { buildUpdateQuery } from '../utils.js';

export class PlanRecipe {
  id: string;
  recipeId: string;
  planId: string;
  meal: string;

  constructor(row: PlanRecipeFromDB) {
    this.id = row.id;
    this.recipeId = row.recipe_id;
    this.planId = row.plan_id;
    this.meal = row.meal;
  }

  static async create({ recipeId, planId, meal }: NewPlanRecipeData): Promise<PlanRecipe> {

    const { rows }: Rows<PlanRecipeFromDB> = await pool.query(
      `INSERT INTO plans_recipes (recipe_id, plan_id, meal)
      VALUES ($1, $2, $3)
      RETURNING *`,
      [recipeId, planId, meal]
    );

    if (!rows[0]) throw new InsertionError('plans_recipes');
    return new PlanRecipe(rows[0]);
  }

  static async findById(id: string): Promise<PlanRecipe | null> {

    const { rows }: Rows<PlanRecipeFromDB> = await pool.query(
      `SELECT * FROM plans_recipes
      WHERE id = $1`,
      [id]
    );

    return rows[0] ? new PlanRecipe(rows[0]) : null;
  }

  static async updateById(id: string, data: PlanRecipeUpdateData): Promise<PlanRecipe> {
    const query: string = buildUpdateQuery('plans_recipes', data);
    const { rows }: Rows<PlanRecipeFromDB> = await pool.query(query, [id]);
    if (!rows[0]) {
      throw new UpdateError('plans_recipes');
    }

    return new PlanRecipe(rows[0]);
  }

  static async checkPermissionsById(id: string, userId: string): Promise<Permissions> {
    const { rows } = await pool.query(
      `SELECT plan_shares.* FROM plans_recipes
      INNER JOIN meal_plans ON meal_plans.id = plans_recipes.plan_id
      INNER JOIN plan_shares ON plan_shares.plan_id = meal_plans.id
      WHERE plans_recipes.id = $1 AND plan_shares.user_id = $2`,
      [id, userId]
    );

    return {
      view: !!rows[0],
      edit: rows[0] ? rows[0].editable : false
    };
  }

  static async deleteById(id: string): Promise<PlanRecipe> {

    const { rows }: Rows<PlanRecipeFromDB> = await pool.query(
      `DELETE FROM plans_recipes
      WHERE id = $1
      RETURNING *`,
      [id]
    );
    if (!rows[0]) throw new DeletionError('plans_recipes');
    return new PlanRecipe(rows[0]);
  }
}
