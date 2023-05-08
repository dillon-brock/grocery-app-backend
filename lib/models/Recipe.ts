import pool from '../../sql/pool.js';
import { InsertionError } from '../types/error.js';
import { NewRecipeData, RecipeFromDB, RecipeRows } from '../types/recipe.js';

export class Recipe {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;

  constructor(row: RecipeFromDB) {
    this.id = row.id;
    this.userId = row.owner_id;
    this.name = row.name;
    this.description = row.description;
    this.createdAt = row.created_at;
    this.updatedAt = row.updated_at;
  }

  static async create({ ownerId, name, description }: NewRecipeData): Promise<Recipe> {

    const { rows }: RecipeRows = await pool.query(
      `INSERT INTO RECIPES (owner_id, name, description)
      VALUES ($1, $2, $3)
      RETURNING *`,
      [ownerId, name, description]
    );

    if (!rows[0]) throw new InsertionError('recipes');
    return new Recipe(rows[0]);
  }

  static async findByUserId(ownerId: string): Promise<Recipe[]> {

    const { rows }: RecipeRows = await pool.query(
      `SELECT * FROM recipes
      WHERE owner_id = $1`,
      [ownerId]
    );

    return rows.map(row => new Recipe(row));
  }
}
