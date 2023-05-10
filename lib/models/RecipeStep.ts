import pool from '../../sql/pool.js';
import { InsertionError } from '../types/error.js';
import { NewRecipeStepData, RecipeStepFromDB, RecipeStepRows } from '../types/recipe-step.js';

export class RecipeStep {
  id: string;
  num: number;
  detail: string;
  recipeId: string;

  constructor(row: RecipeStepFromDB) {
    this.id = row.id;
    this.num = row.num;
    this.detail = row.detail;
    this.recipeId = row.recipe_id;
  }

  static async create({ num, detail, recipeId }: NewRecipeStepData): Promise<RecipeStep> {
    const { rows }: RecipeStepRows = await pool.query(
      `INSERT INTO recipe_steps (num, detail, recipe_id)
      VALUES ($1, $2, $3)
      RETURNING *`,
      [num, detail, recipeId]
    );

    if (!rows[0]) {
      throw new InsertionError('recipe_steps');
    }
    return new RecipeStep(rows[0]);
  }
}