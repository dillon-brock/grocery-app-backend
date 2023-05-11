import { NextFunction, Response } from 'express-serve-static-core';
import { AuthenticatedRequest } from '../../../types/extendedExpress.js';
import { Recipe } from '../../../models/Recipe.js';
import { ErrorWithStatus } from '../../../types/error.js';

export default async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const recipeId = req.query.recipeId as string;
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      throw new ErrorWithStatus('Recipe not found', 404);
    }

    if (recipe.ownerId != req.user.id) {
      throw new ErrorWithStatus('You are not authorized to view this information', 403);
    }

    next();
  } catch (e) {
    next(e);
  }
};
