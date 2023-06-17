import { NextFunction, Response } from 'express-serve-static-core';
import { TypedAuthenticatedRequest } from '../../../types/extendedExpress.js';
import { PlanRecipeUpdateData } from '../../../types/planRecipe.js';
import { PlanRecipe } from '../../../models/PlanRecipe.js';
import { ErrorWithStatus } from '../../../types/error.js';
import { Recipe } from '../../../models/Recipe.js';

export default async (req: TypedAuthenticatedRequest<PlanRecipeUpdateData, { id: string }>, res: Response, next: NextFunction) => {
  try {
    const mealPlanPermissions = await PlanRecipe.checkPermissionsById(req.params.id, req.user.id);
    if (!mealPlanPermissions.view) {
      throw new ErrorWithStatus('You are not authorized to access this meal plan', 403);
    }
    if (!mealPlanPermissions.edit) {
      throw new ErrorWithStatus('You are not authorized to edit this meal plan', 403);
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'recipe_id')) {
      const recipeId = req.body.recipe_id;
      if (recipeId) {
        const recipe = await Recipe.findById(recipeId);
        if (!recipe) {
          throw new ErrorWithStatus('Recipe not found', 404);
        }
        const userPermissions = await recipe.checkUserPermissions(req.user.id);
        if (!userPermissions.view) {
          throw new ErrorWithStatus('You do not have access to this recipe', 403);
        }
      }
    }
    next();
  } catch (e) {
    next(e);
  }
};