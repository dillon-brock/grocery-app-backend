import { NextFunction, Response } from 'express-serve-static-core';
import { TypedAuthenticatedRequest } from '../../../types/extendedExpress.js';
import { MealPlanUpdateData } from '../../../types/mealPlan.js';
import { ErrorWithStatus } from '../../../types/error.js';

export default async (req: TypedAuthenticatedRequest<MealPlanUpdateData, { id: string }>, res: Response, next: NextFunction) => {
  try {
    const { date } = req.body;
    if (!date) {
      throw new ErrorWithStatus('Invalid payload - date is required', 400);
    }
    if (typeof date != 'string') {
      throw new ErrorWithStatus('Invalid payload - date must be string', 400);
    }
    next();
  } catch (e) {
    next(e);
  }
};
