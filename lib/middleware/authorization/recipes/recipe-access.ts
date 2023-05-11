import { NextFunction, Response } from 'express-serve-static-core';
import { AuthenticatedReqParams } from '../../../types/extendedExpress.js';
import { Recipe } from '../../../models/Recipe.js';
import { ErrorWithStatus } from '../../../types/error.js';
import { Permissions } from '../../../types/global.js';

export default async (req: AuthenticatedReqParams<{id: string}>, res: Response, next: NextFunction) => {

  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      throw new ErrorWithStatus('Recipe not found', 404);
    }

    if (recipe.ownerId != req.user.id) {
      const userPermissions: Permissions = await recipe.checkUserPermissions(req.user.id);
      let authorized: boolean;
      if (req.method == 'GET') {
        authorized = userPermissions.view;
      }
      else if (req.method == 'PUT') {
        authorized = userPermissions.edit;
      }
      else {
        authorized = false;
      }
  
      if (!authorized) {
        throw new ErrorWithStatus('You do not have access to this recipe', 403);
      }
    }
    next();
  }
  catch (e) {
    next(e);
  }
};

