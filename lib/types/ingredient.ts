import { Rows } from './global.js';

export interface IngredientFromDB {
  id: string;
  recipe_id: string;
  name: string;
  amount: string | null;
}

export type IngredientRows = Rows<IngredientFromDB>;

export interface NewIngredientData {
  recipeId: string;
  name: string;
  amount: string | null;
}
