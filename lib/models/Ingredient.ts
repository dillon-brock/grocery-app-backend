import pool from '../../sql/pool.js';
import { DeletionError, InsertionError, UpdateError } from '../types/error.js';
import { CreateIngredientParams, IngredientFromDB, IngredientRows, IngredientUpdateData } from '../types/ingredient.js';
import { buildUpdateQuery } from '../utils.js';

export class Ingredient {
  id: string;
  recipeId: string;
  name: string;
  amount: string | null;

  constructor(row: IngredientFromDB) {
    this.id = row.id;
    this.recipeId = row.recipe_id;
    this.name = row.name;
    this.amount = row.amount;
  }

  static async create({ name, amount, recipeId }: CreateIngredientParams): Promise<Ingredient> {
    const { rows }: IngredientRows = await pool.query(
      `INSERT INTO ingredients (name, amount, recipe_id)
      VALUES ($1, $2, $3)
      RETURNING *`,
      [name, amount, recipeId]
    );

    if (!rows[0]) throw new InsertionError('ingredients');
    return new Ingredient(rows[0]);
  }

  static async findById(id: string): Promise<Ingredient | null> {
    const { rows }: IngredientRows = await pool.query(
      `SELECT * FROM ingredients
      WHERE id = $1`,
      [id]
    );

    if (!rows[0]) return null;
    return new Ingredient(rows[0]);
  }

  static async updateById(id: string, data: IngredientUpdateData): Promise<Ingredient> {
    const query = buildUpdateQuery('ingredients', data);
    const { rows }: IngredientRows = await pool.query(query, [id]);

    if (!rows[0]) {
      throw new UpdateError('ingredients');
    }
    return new Ingredient(rows[0]);
  }

  static async findByRecipeId(recipeId: string): Promise<Ingredient[]> {
    const { rows }: IngredientRows = await pool.query(
      `SELECT * FROM ingredients
      WHERE recipe_id = $1`,
      [recipeId]
    );

    return rows.map(row => new Ingredient(row));
  }

  static async deleteById(id: string): Promise<Ingredient> {
    const { rows }: IngredientRows = await pool.query(
      `DELETE FROM ingredients
      WHERE id = $1
      RETURNING *`,
      [id]
    );

    if (!rows[0]) {
      throw new DeletionError('ingredients');
    }
    return new Ingredient(rows[0]);
  }
}
