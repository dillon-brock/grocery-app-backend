import pool from '../../sql/pool.js';
import { InsertionError, UpdateError } from '../types/error.js';
import { RecipeRows } from '../types/recipe.js';
import { NewRecipeShareData, RecipeShareFromDB, RecipeShareRows, RecipeShareUpdateData } from '../types/recipeShare.js';
import { UserRows } from '../types/user.js';
import { buildUpdateQuery } from '../utils.js';
import { Recipe } from './Recipe.js';
import { User } from './User.js';

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

  static async findById(id: string): Promise<RecipeShare | null> {
    const { rows }: RecipeShareRows = await pool.query(
      `SELECT * FROM recipe_shares
      WHERE id = $1`,
      [id]
    );

    if (!rows[0]) return null;
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

  static async findUsersByRecipeId(recipeId: string): Promise<User[]> {

    const { rows }: UserRows = await pool.query(
      `SELECT users.username, users.email FROM recipe_shares
      INNER JOIN users ON users.id = recipe_shares.user_id
      WHERE recipe_shares.recipe_id = $1`,
      [recipeId]
    );

    return rows.map(row => new User(row));
  }

  static async updateById(id: string, data: RecipeShareUpdateData): Promise<RecipeShare> {

    const query = buildUpdateQuery('recipe_shares', data);
    const { rows }: RecipeShareRows = await pool.query(query, [id]);

    if (!rows[0]) throw new UpdateError('recipe_shares');
    return new RecipeShare(rows[0]);
  }
}
