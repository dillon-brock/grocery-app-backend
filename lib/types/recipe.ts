import { Ingredient } from '../models/Ingredient.js';
import { Recipe } from '../models/Recipe.js';
import { RecipeStep } from '../models/RecipeStep.js';
import { Rows, SuccessResponse } from './global.js';

export type RecipeFromDB = {
  id: string;
  owner_id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export type RecipeRows = Rows<RecipeFromDB>

export interface NewRecipeBody {
  name: string;
}

export interface NewRecipeData extends NewRecipeBody {
  ownerId: string;
}

export interface RecipeRes extends SuccessResponse {
  recipe: Recipe | null;
}

export interface MultipleRecipesRes extends SuccessResponse {
  recipes: Recipe[]
}

export interface UpdateRecipeData {
  name?: string;
  description?: string;
}

export interface RecipeWithDetailFromDB extends RecipeFromDB {
  ingredients: Ingredient[]
  steps: RecipeStep[]
}

