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
