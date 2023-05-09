import { RecipeShare } from '../models/RecipeShare.js';
import { Rows } from './global.js';

export type RecipeShareFromDB = {
  id: string;
  recipe_id: string;
  user_id: string;
  editable: boolean;
}

export type RecipeShareRows = Rows<RecipeShareFromDB>;

export type NewRecipeShareData = {
  recipeId: string;
  userId: string;
}

export type RecipeShareRes = {
  message: string;
  recipeShare: RecipeShare;
}
