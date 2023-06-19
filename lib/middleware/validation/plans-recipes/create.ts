import { NextFunction, Response } from 'express-serve-static-core';
import { AuthenticatedReqBody } from '../../../types/extendedExpress.js';
import { NewPlanRecipeData } from '../../../types/planRecipe.js';
import { ErrorWithStatus } from '../../../types/error.js';

export default async (req: AuthenticatedReqBody<NewPlanRecipeData>, res: Response, next: NextFunction) => {
  try {
    const expectedArgs: Array<keyof NewPlanRecipeData> = ['planId', 'recipeId', 'meal'];
    for (const arg of expectedArgs) {
      if (req.body[arg] === undefined || req.body[arg] === '') {
        throw new ErrorWithStatus(`Invalid payload - ${arg} is required`, 400);
      }
      if (typeof req.body[arg] != 'string') {
        throw new ErrorWithStatus(`Invalid payload - ${arg} must be string`, 400);
      }
    }
    next();
  } catch (e) {
    next(e);
  }
};
