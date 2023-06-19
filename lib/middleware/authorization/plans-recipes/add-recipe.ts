import { NextFunction, Response } from 'express-serve-static-core';
import { AuthenticatedReqBody } from '../../../types/extendedExpress.js';
import { NewPlanRecipeData } from '../../../types/planRecipe.js';
import { Recipe } from '../../../models/Recipe.js';
import { ErrorWithStatus } from '../../../types/error.js';
import { MealPlan } from '../../../models/MealPlan.js';

export default async (req: AuthenticatedReqBody<NewPlanRecipeData>, res: Response, next: NextFunction) => {
  try {
    const { recipeId, planId } = req.body;
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      throw new ErrorWithStatus('Recipe not found', 404);
    }
    if (recipe.ownerId != req.user.id) {
      const userPermissions = await recipe.checkUserPermissions(req.user.id);
      if (!userPermissions.view) {
        throw new ErrorWithStatus('You do not have access to this recipe', 403);
      }
    }

    const mealPlan = await MealPlan.findById(planId);
    if (!mealPlan) {
      throw new ErrorWithStatus('Meal plan not found', 404);
    }
    if (mealPlan.ownerId != req.user.id) {
      const userPermissions = await mealPlan.checkPermissions(req.user.id);
      if (!userPermissions.edit) {
        throw new ErrorWithStatus('You are not authorized to edit this meal plan', 403);
      }
    }

    next();
  } catch (e) {
    next(e);
  }
};
