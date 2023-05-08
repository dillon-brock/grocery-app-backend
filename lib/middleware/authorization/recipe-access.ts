import { NextFunction, Response } from 'express-serve-static-core';
import { AuthenticatedReqParams } from '../../types/extendedExpress.js';
import { Recipe } from '../../models/Recipe.js';
import { ErrorWithStatus } from '../../types/error.js';

export default async (req: AuthenticatedReqParams<{id: string}>, res: Response, next: NextFunction) => {

  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      throw new ErrorWithStatus('Recipe not found', 404);
    }
    const userCanView = await recipe.checkIfUserCanView(req.user.id);

    if (recipe.ownerId != req.user.id && !userCanView) {
      throw new ErrorWithStatus('You do not have access to this recipe', 403);
    }
    next();
  }
  catch (e) {
    next(e);
  }
};

