import pool from '../../sql/pool.js';
import { DeletionError, InsertionError, UpdateError } from '../types/error.js';
import { Permissions } from '../types/global.js';
import { NewRecipeData, RecipeFromDB, RecipeRows, UpdateRecipeData } from '../types/recipe.js';
import { RecipeShareRows } from '../types/recipeShare.js';

export class Recipe {
  id: string;
  ownerId: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;

  constructor(row: RecipeFromDB) {
    this.id = row.id;
    this.ownerId = row.owner_id;
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

  static async findById(id: string): Promise<Recipe | null> {

    const { rows }: RecipeRows = await pool.query(
      `SELECT * FROM recipes
      WHERE id = $1`,
      [id]
    );

    if (!rows[0]) return null;
    return new Recipe(rows[0]);
  }

  static async updateById(id: string, data: UpdateRecipeData): Promise<Recipe> {

    const query = `UPDATE recipes SET
    ${Object.entries(data)
    .map(([k, v]) => {
      let newVal: string = `${v}`;
      if (typeof v == 'string') {
        newVal = `'${v}'`;
      }
      return `${k} = ` + newVal;
    }).join(', ')}
      WHERE id = $1
      RETURNING *`;
    
    const { rows }: RecipeRows = await pool.query(query, [id]);

    if (!rows[0]) throw new UpdateError('recipes');
    return new Recipe(rows[0]);
  }

  static async deleteById(id: string): Promise<Recipe> {

    const { rows }: RecipeRows = await pool.query(
      `DELETE FROM recipes
      WHERE id = $1
      RETURNING *`,
      [id]
    );

    if (!rows[0]) throw new DeletionError('recipes');
    return new Recipe(rows[0]);
  }

  async checkUserPermissions(userId: string): Promise<Permissions> {

    const { rows }: RecipeShareRows = await pool.query(
      `SELECT recipe_shares.* FROM recipes
      INNER JOIN recipe_shares ON recipe_shares.recipe_id = recipes.id
      WHERE recipes.id = $1 AND recipe_shares.user_id = $2`,
      [this.id, userId]
    );

    return {
      view: !!rows[0],
      edit: rows[0] ? rows[0].editable : false
    };
  }
}
