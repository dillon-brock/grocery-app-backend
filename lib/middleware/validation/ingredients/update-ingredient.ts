import { NextFunction, Response } from 'express-serve-static-core';
import { AuthenticatedReqBody } from '../../../types/extendedExpress.js';
import { IngredientUpdateData } from '../../../types/ingredient.js';
import { ErrorWithStatus } from '../../../types/error.js';

export default async (req: AuthenticatedReqBody<IngredientUpdateData>, res: Response, next: NextFunction) => {
  try {
    const expectedArgs: Array<keyof IngredientUpdateData> = ['amount', 'name'];
    for (const key of Object.keys(req.body) as Array<keyof IngredientUpdateData>) {
      if (!expectedArgs.includes(key)) {
        throw new ErrorWithStatus(`Invalid payload - unexpected argument ${key}`, 400);
      }
      if (typeof req.body[key] != 'string') {
        throw new ErrorWithStatus(`Invalid payload - ${key} must be string`, 400);
      }
    }
    next();
  } catch(e) {
    next(e);
  }
};
