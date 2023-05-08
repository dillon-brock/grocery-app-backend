import pool from '../../sql/pool.js';
import { InsertionError } from '../types/error.js';
import { NewRecipeShareData, RecipeShareFromDB, RecipeShareRows } from '../types/recipeShare.js';

export class RecipeShare {
  id: string;
  recipeId: string;
  userId: string;

  constructor(row: RecipeShareFromDB) {
    this.id = row.id;
    this.recipeId = row.recipe_id;
    this.userId = row.user_id;
  }

  static async create({ recipeId, userId }: NewRecipeShareData): Promise<RecipeShare> {

    const { rows }: RecipeShareRows = await pool.query(
      `INSERT INTO recipe_shares (user_id, recipe_id)
      VALUES ($1, $2)
      RETURNING *`,
      [userId, recipeId]
    );

    if (!rows[0]) throw new InsertionError('recipe_shares');
    return new RecipeShare(rows[0]);
  }
}
