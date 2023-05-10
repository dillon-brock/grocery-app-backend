import { NextFunction, Response } from 'express-serve-static-core';
import { TypedAuthenticatedRequest } from '../../types/extendedExpress.js';
import { IngredientUpdateData } from '../../types/ingredient.js';
import { Ingredient } from '../../models/Ingredient.js';
import { ErrorWithStatus } from '../../types/error.js';
import { Recipe } from '../../models/Recipe.js';

export default async (req: TypedAuthenticatedRequest<IngredientUpdateData, { id: string }>,
  res: Response, next: NextFunction) => {
  try {
    const ingredient = await Ingredient.findById(req.params.id);
    if (!ingredient) {
      throw new ErrorWithStatus('Ingredient not found', 404);
    }

    const recipe = await Recipe.findById(ingredient.recipeId);
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
