import { NextFunction, Response } from 'express-serve-static-core';
import { AuthenticatedReqBody } from '../../../types/extendedExpress.js';
import { NewStepReqBody } from '../../../types/recipe-step.js';
import { ErrorWithStatus } from '../../../types/error.js';

export default async (req: AuthenticatedReqBody<NewStepReqBody>, res: Response, next: NextFunction) => {
  try {
    const { num, detail } = req.body;
    const { recipeId } = req.query;

    if (!recipeId) {
      throw new ErrorWithStatus('Invalid query - recipeId is required', 400);
    }

    if (num == undefined) {
      throw new ErrorWithStatus('Invalid payload - num is required', 400);
    }

    if (typeof num != 'number') {
      throw new ErrorWithStatus('Invalid payload - num must be number', 400);
    }

    if (detail == undefined) {
      throw new ErrorWithStatus('Invalid payload - detail is required', 400);
    }

    if (typeof detail != 'string') {
      throw new ErrorWithStatus('Invalid payload - detail must be string', 400);
    }
    next();
  }
  catch (e) {
    next(e);
  }
};
