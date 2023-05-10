import pool from '../../sql/pool.js';
import { InsertionError } from '../types/error.js';
import { IngredientFromDB, IngredientRows, NewIngredientData } from '../types/ingredient.js';

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

  static async create({ recipeId, name, amount }: NewIngredientData): Promise<Ingredient> {
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
}
