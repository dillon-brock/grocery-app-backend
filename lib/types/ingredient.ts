import { Ingredient } from '../models/Ingredient.js';
import { Rows, SuccessResponse } from './global.js';

export interface IngredientFromDB {
  id: string;
  recipe_id: string;
  name: string;
  amount: string | null;
}

export type IngredientRows = Rows<IngredientFromDB>;

export interface NewIngredientData {
  name: string;
  amount: string | null;
}

export interface IngredientRes extends SuccessResponse {
  ingredient: Ingredient;
}

export interface MultipleIngredientRes extends SuccessResponse {
  ingredients: Ingredient[];
}

export type IngredientUpdateData = {
  name?: string;
  amount?: string;
}

export interface CreateIngredientParams extends NewIngredientData {
  recipeId: string;
}
