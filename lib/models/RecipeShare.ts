import pool from '../../sql/pool.js';
import { InsertionError } from '../types/error.js';
import { RecipeRows } from '../types/recipe.js';
import { NewRecipeShareData, RecipeShareFromDB, RecipeShareRows } from '../types/recipeShare.js';
import { Recipe } from './Recipe.js';

export class RecipeShare {
  id: string;
  recipeId: string;
  userId: string;
  editable: boolean;

  constructor(row: RecipeShareFromDB) {
    this.id = row.id;
    this.recipeId = row.recipe_id;
    this.userId = row.user_id;
    this.editable = row.editable;
  }

  static async create({ recipeId, userId, editable }: NewRecipeShareData): Promise<RecipeShare> {

    const { rows }: RecipeShareRows = await pool.query(
      `INSERT INTO recipe_shares (user_id, recipe_id, editable)
      VALUES ($1, $2, $3)
      RETURNING *`,
      [userId, recipeId, editable]
    );

    if (!rows[0]) throw new InsertionError('recipe_shares');
    return new RecipeShare(rows[0]);
  }

  static async findRecipesByUserId(userId: string): Promise<Recipe[]> {

    const { rows }: RecipeRows = await pool.query(
      `SELECT recipes.* FROM recipe_shares
      INNER JOIN recipes ON recipes.id = recipe_shares.recipe_id
      WHERE recipe_shares.user_id = $1`,
      [userId]
    );

    return rows.map(row => new Recipe(row));
  }
}
