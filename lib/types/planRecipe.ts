import { PlanRecipe } from '../models/PlanRecipe.js';
import { SuccessResponse } from './global.js';

export interface PlanRecipeFromDB {
  id: string;
  recipe_id: string;
  plan_id: string;
  meal: string;
}

export interface NewPlanRecipeData {
  recipeId: string;
  planId: string;
  meal: string;
}

export interface PlanRecipeRes extends SuccessResponse {
  planRecipe: PlanRecipe
}

export type PlanRecipeUpdateData = {
  recipe_id?: string;
  meal?: string;
}


