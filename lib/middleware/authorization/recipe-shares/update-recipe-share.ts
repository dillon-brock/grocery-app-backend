import { NextFunction, Response } from 'express-serve-static-core';
import { TypedAuthenticatedRequest } from '../../../types/extendedExpress.js';
import { RecipeShareUpdateData } from '../../../types/recipeShare.js';
import { RecipeShare } from '../../../models/RecipeShare.js';
import { ErrorWithStatus } from '../../../types/error.js';
import { Recipe } from '../../../models/Recipe.js';

export default async (req: TypedAuthenticatedRequest<RecipeShareUpdateData, { id: string}>,
  res: Response, next: NextFunction) => {
  try {
    const share = await RecipeShare.findById(req.params.id);
    if (!share) {
      throw new ErrorWithStatus('Share data not found', 404);
    }

    const recipe = await Recipe.findById(share.recipeId);
    if (!recipe) {
      throw new ErrorWithStatus('Recipe not found', 404);
    }

    if (recipe.ownerId != req.user.id) {
      throw new ErrorWithStatus('You are not authorized to make changes to this information', 403);
    }

    next();
  } catch (e) {
    next(e);
  }
};
