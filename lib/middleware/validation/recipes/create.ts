import { NextFunction, Response } from 'express-serve-static-core';
import { AuthenticatedReqBody } from '../../../types/extendedExpress.js';
import { NewRecipeBody } from '../../../types/recipe.js';
import { ErrorWithStatus } from '../../../types/error.js';

export default async (req: AuthenticatedReqBody<NewRecipeBody>, res: Response, next: NextFunction) => {
  try {
    const { name } = req.body;

    if (!name) {
      throw new ErrorWithStatus('Invalid payload - name is required', 400);
    }
    if (typeof name != 'string') {
      throw new ErrorWithStatus('Invalid payload - name must be string', 400);
    }
    next();
  } catch (e) {
    next(e);
  }
};
