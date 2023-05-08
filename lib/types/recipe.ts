import { Recipe } from '../models/Recipe.js';
import { Rows, SuccessResponse } from './global.js';

export type RecipeFromDB = {
  id: string;
  user_id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export type RecipeRows = Rows<RecipeFromDB>

export interface NewRecipeBody {
  name: string;
  description: string | null;
}

export interface NewRecipeData extends NewRecipeBody {
  userId: string;
}

export interface RecipeRes extends SuccessResponse {
  recipe: Recipe
}

export interface MultipleRecipesRes extends SuccessResponse {
  recipes: Recipe[]
}


