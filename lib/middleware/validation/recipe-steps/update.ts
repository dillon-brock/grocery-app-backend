import { NextFunction, Response } from 'express-serve-static-core';
import { AuthenticatedReqBody } from '../../../types/extendedExpress.js';
import { StepUpdateData } from '../../../types/recipeStep.js';
import { ErrorWithStatus } from '../../../types/error.js';

export default async (req: AuthenticatedReqBody<StepUpdateData>, res: Response, next: NextFunction) => {
  try {
    const { num, detail } = req.body;

    if (num != undefined && typeof num != 'number') {
      throw new ErrorWithStatus('Invalid payload - num must be number or omitted', 400);
    }

    if (detail && typeof detail != 'string') {
      throw new ErrorWithStatus('Invalid payload - detail must be string or omitted', 400);
    }

    if (detail === '') {
      throw new ErrorWithStatus('Invalid payload - detail cannot be empty string', 400);
    }
    next();
  } catch (e) {
    next(e);
  }
};
