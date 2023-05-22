import { NextFunction, Response } from 'express-serve-static-core';
import { AuthenticatedReqBody } from '../../../types/extendedExpress.js';
import { NewIngredientData } from '../../../types/ingredient.js';
import { ErrorWithStatus } from '../../../types/error.js';

export default async (req: AuthenticatedReqBody<NewIngredientData>, res: Response, next: NextFunction) => {
  try {
    const recipeId = req.query.recipeId;
    if (!recipeId) {
      throw new ErrorWithStatus('Invalid query - recipeId required', 400);
    }

    if (Object.keys(req.body).length > 2) {
      throw new ErrorWithStatus('Invalid payload - too many arguments', 400);
    }
    if (!req.body.name) {
      throw new ErrorWithStatus('Invalid payload - name required', 400);
    }
    if (typeof req.body.name != 'string') {
      throw new ErrorWithStatus('Invalid payload - name must be string', 400);
    }
    if (typeof req.body.amount != 'string' && req.body.amount != null) {
      throw new ErrorWithStatus('Invalid payload - amount must be string or null', 400);
    }

    next();
  }
  catch (e) {
    next(e);
  }
};
