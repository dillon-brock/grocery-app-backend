import { NextFunction, Response } from 'express-serve-static-core';
import { AuthenticatedReqBody } from '../../../types/extendedExpress.js';
import { NewIngredientData } from '../../../types/ingredient.js';
import { Recipe } from '../../../models/Recipe.js';
import { ErrorWithStatus } from '../../../types/error.js';

export default async (req: AuthenticatedReqBody<NewIngredientData>, res: Response, next: NextFunction) => {
  try {
    const recipe = await Recipe.findById(req.body.recipeId);
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