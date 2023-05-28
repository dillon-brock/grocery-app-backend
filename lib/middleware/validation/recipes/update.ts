import { NextFunction, Response } from 'express-serve-static-core';
import { AuthenticatedReqBody } from '../../../types/extendedExpress.js';
import { UpdateRecipeData } from '../../../types/recipe.js';
import { ErrorWithStatus } from '../../../types/error.js';

export default async (req: AuthenticatedReqBody<UpdateRecipeData>, res: Response, next: NextFunction) => {
  try {
    const { name } = req.body;
    if (name !== undefined && typeof name != 'string') {
      throw new ErrorWithStatus('Invalid payload - name must be string', 400);
    }
    if (name === '') {
      throw new ErrorWithStatus('Invalid payload - name cannot be empty string', 400);
    }
    next();
  } catch (e) {
    next(e);
  }
};
