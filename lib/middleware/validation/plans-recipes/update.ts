import { NextFunction, Response } from 'express-serve-static-core';
import { TypedAuthenticatedRequest } from '../../../types/extendedExpress.js';
import { PlanRecipeUpdateData } from '../../../types/planRecipe.js';
import { ErrorWithStatus } from '../../../types/error.js';

export default async (req: TypedAuthenticatedRequest<PlanRecipeUpdateData, { id: string }>, res: Response, next: NextFunction) => {
  try {
    const possibleArgs: Set<keyof PlanRecipeUpdateData> = new Set(['recipe_id', 'meal']);
    const args = Object.keys(req.body);

    if (args.includes('recipeId')) {
      throw new ErrorWithStatus('Invalid payload - unexpected argument recipeId (did you mean recipe_id?)', 400);
    }

    const keys = args as Array<keyof PlanRecipeUpdateData>;

    for (const key of keys) {
      if (!possibleArgs.has(key)) {
        throw new ErrorWithStatus(`Invalid payload - unexpected argument ${key}`, 400);
      }
      if (typeof req.body[key] != 'string') {
        throw new ErrorWithStatus(`Invalid payload - ${key} must be string`, 400);
      }
    }
    
    next();
  } catch (e) {
    next(e);
  }
};
