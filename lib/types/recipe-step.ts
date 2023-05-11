import { RecipeStep } from '../models/RecipeStep.js';
import { Rows, SuccessResponse } from './global.js';

export type RecipeStepFromDB = {
  id: string;
  num: number;
  detail: string;
  recipe_id: string;
};

export type RecipeStepRows = Rows<RecipeStepFromDB>

export interface NewStepReqBody {
  num: number;
  detail: string;
}

export interface NewRecipeStepData extends NewStepReqBody {
  recipeId: string;
}

export interface RecipeStepRes extends SuccessResponse {
  step: RecipeStep
}

export interface MultipleStepRes extends SuccessResponse {
  steps: RecipeStep[];
}

export interface StepUpdateData {
  num?: number;
  detail?: string;
}
