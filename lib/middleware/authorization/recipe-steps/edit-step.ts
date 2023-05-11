import { NextFunction, Response } from 'express-serve-static-core';
import { AuthenticatedReqParams } from '../../../types/extendedExpress.js';
import { RecipeStep } from '../../../models/RecipeStep.js';
import { ErrorWithStatus } from '../../../types/error.js';
import { Recipe } from '../../../models/Recipe.js';

export default async (req: AuthenticatedReqParams<{ id: string}>, res: Response, next: NextFunction) => {
  try {
    const step = await RecipeStep.findById(req.params.id);
    if (!step) {
      throw new ErrorWithStatus('Step not found', 404);
    }

    const recipe = await Recipe.findById(step.recipeId);
    if (!recipe) {
      throw new ErrorWithStatus('Recipe not found', 404);
    }

    if (recipe.ownerId != req.user.id) {
      const userPermissions = await recipe.checkUserPermissions(req.user.id);
      if (!userPermissions.edit) {
        throw new ErrorWithStatus('You are not authorized to edit this recipe', 403);
      }
    }

    next();
  } catch (e) {
    next(e);
  }
};
