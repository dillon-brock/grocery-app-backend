import { NextFunction, Response } from 'express-serve-static-core';
import { TypedAuthenticatedRequest } from '../../../types/extendedExpress.js';
import { PlanRecipeUpdateData } from '../../../types/planRecipe.js';
import { ErrorWithStatus } from '../../../types/error.js';
import { Recipe } from '../../../models/Recipe.js';

export default async (req: TypedAuthenticatedRequest<PlanRecipeUpdateData, { id: string }>, res: Response, next: NextFunction) => {
  try {
    // authorize access to new recipe if changing recipeId
    const recipeId = req.body['recipe_id'];
    if (recipeId) {
      const recipe = await Recipe.findById(recipeId);
      if (!recipe) {
        throw new ErrorWithStatus('Recipe not found', 404);
      }
      if (req.user.id != recipe.ownerId) {
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
