import { NextFunction, Response } from 'express-serve-static-core';
import { AuthenticatedReqBody } from '../../../types/extendedExpress.js';
import { ListShareUpdateData } from '../../../types/listShare.js';
import { ErrorWithStatus } from '../../../types/error.js';
import { RecipeShareUpdateData } from '../../../types/recipeShare.js';

export default async (req: AuthenticatedReqBody<ListShareUpdateData | RecipeShareUpdateData>, res: Response, next: NextFunction) => {
  try {
    const { editable } = req.body;
    if (editable == undefined) {
      throw new ErrorWithStatus('Invalid payload - editable is required', 400);
    }
    if (typeof editable != 'boolean') {
      throw new ErrorWithStatus('Invalid payload - editable must be boolean', 400);
    }
    next();
  } catch (e) {
    next(e);
  }
};
