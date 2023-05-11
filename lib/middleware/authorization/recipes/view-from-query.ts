import { NextFunction, Response } from 'express-serve-static-core';
import { AuthenticatedRequest } from '../../../types/extendedExpress.js';
import { Recipe } from '../../../models/Recipe.js';
import { ErrorWithStatus } from '../../../types/error.js';
import { Permissions } from '../../../types/global.js';

export default async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const recipeId = req.query.recipeId;
    if (!recipeId) {
      throw new ErrorWithStatus('Missing recipeId query parameter', 400);
    }
    const recipe = await Recipe.findById(recipeId as string);
    if (!recipe) {
      throw new ErrorWithStatus('Recipe not found', 404);
    }

    if (recipe.ownerId != req.user.id) {
      const userPermissions: Permissions = await recipe.checkUserPermissions(req.user.id);
      if (!userPermissions.view) {
        throw new ErrorWithStatus('You are not authorized to view this recipe', 403);
      }
    }

    next();
  } catch (e) {
    next(e);
  }
};
