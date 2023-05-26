import { NextFunction, Response } from 'express-serve-static-core';
import { AuthenticatedReqBody } from '../../../types/extendedExpress.js';
import { NewRecipeShareData } from '../../../types/recipeShare.js';
import { ErrorWithStatus } from '../../../types/error.js';

export default async (req: AuthenticatedReqBody<NewRecipeShareData>, res: Response, next: NextFunction) => {
  try {

    const requiredArgs: Set<keyof NewRecipeShareData> = new Set(['recipeId', 'userId', 'editable']);
    
    for (const key of requiredArgs) {
      if (req.body[key] == undefined) {
        throw new ErrorWithStatus(`Invalid payload - ${key} is required`, 400);
      }
      if (key != 'editable' && typeof req.body[key] != 'string') {
        throw new ErrorWithStatus(`Invalid payload - ${key} must be string`, 400);
      }
      else if (key == 'editable' && typeof req.body[key] != 'boolean') {
        throw new ErrorWithStatus('Invalid payload - editable must be boolean', 400);
      }
    }

    for (const k of Object.keys(req.body) as Array<keyof NewRecipeShareData>) {
      if (!requiredArgs.has(k)) {
        throw new ErrorWithStatus(`Invalid payload - unexpected argument ${k}`, 400);
      }
    }
    next();
  } catch (e) {
    next(e);
  }
};
