import { NextFunction, Response } from 'express-serve-static-core';
import { AuthenticatedReqBody } from '../../types/extendedExpress.js';
import { NewRecipeShareData } from '../../types/recipeShare.js';
import { Recipe } from '../../models/Recipe.js';
import { ErrorWithStatus } from '../../types/error.js';
import { User } from '../../models/User.js';

export default async (req: AuthenticatedReqBody<NewRecipeShareData>, 
  res: Response, next: NextFunction) => {
  try {
    const recipe = await Recipe.findById(req.body.recipeId);
    if (!recipe) {
      throw new ErrorWithStatus('Recipe not found', 404);
    }
    const user = await User.findById(req.body.userId);
    if (!user) {
      throw new ErrorWithStatus('User not found', 404);
    }

    if (recipe.ownerId != req.user.id) {
      throw new ErrorWithStatus('You are not authorized to share this recipe', 403);
    }

    next();
  } catch (e) {
    next(e);
  }
};
