import { NextFunction, Response } from 'express-serve-static-core';
import { TypedAuthenticatedRequest } from '../../../types/extendedExpress.js';
import { PlanShareUpdateData } from '../../../types/planShare.js';
import { MealPlan } from '../../../models/MealPlan.js';
import { ErrorWithStatus } from '../../../types/error.js';

export default async (req: TypedAuthenticatedRequest<PlanShareUpdateData, { id: string }>, res: Response, next: NextFunction) => {
  try {
    const mealPlan = await MealPlan.findById(req.params.id);
    if (!mealPlan) {
      throw new ErrorWithStatus('Meal plan not found', 404);
    }

    if (mealPlan.ownerId != req.user.id) {
      throw new ErrorWithStatus('You are not authorized to edit the share settings of this meal plan', 403);
    }
    next();
  } catch (e) {
    next(e);
  }
};
