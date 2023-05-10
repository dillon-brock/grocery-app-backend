import { Rows } from './global.js';

export type RecipeStepFromDB = {
  id: string;
  num: number;
  detail: string;
  recipe_id: string;
};

export type RecipeStepRows = Rows<RecipeStepFromDB>

export type NewRecipeStepData = {
  num: number;
  detail: string;
}
