import { MealPlan, MealPlanWithRecipes } from '../models/MealPlan.js';
import { SuccessResponse } from './global.js';

export interface MealPlanFromDB {
  id: string;
  owner_id: string;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface NewMealPlanData {
  date: string;
}

export interface CreateMealPlanParams extends NewMealPlanData {
  ownerId: string;
}

export interface MealPlanRes extends SuccessResponse {
  mealPlan: MealPlan
}

export type MealPlanUpdateData = {
  date: string;
}

export type CoalescedRecipe = {
  id: string;
  name: string;
}

export interface MealPlanWithRecipesFromDB extends MealPlanFromDB {
  recipes: CoalescedRecipe[];
}

export interface MealPlanWithRecipesRes extends SuccessResponse {
  mealPlan: MealPlanWithRecipes | null;
}

export interface MultipleMealPlanWithRecipesRes extends SuccessResponse {
  mealPlans: Array<MealPlanWithRecipes | null>;
}
