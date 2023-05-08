import { Rows } from './global.js';

export type RecipeFromDB = {
  id: string;
  user_id: string;
  name: string;
  description: string;
}

export type RecipeRows = Rows<RecipeFromDB>

export interface NewRecipeData {
  userId: string;
  name: string;
  description: string | null;
}