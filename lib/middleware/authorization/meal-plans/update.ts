import { NextFunction, Response } from 'express-serve-static-core';
import { TypedAuthenticatedRequest } from '../../../types/extendedExpress.js';
import { MealPlanUpdateData } from '../../../types/mealPlan.js';
import { MealPlan } from '../../../models/MealPlan.js';
import { ErrorWithStatus } from '../../../types/error.js';

export default async (req: TypedAuthenticatedRequest<MealPlanUpdateData, { id: string }>, res: Response, next: NextFunction) => {
  try {
    const plan = await MealPlan.findById(req.params.id);
    if (!plan) {
      throw new ErrorWithStatus('Meal plan not found', 404);
    }
    
    if (plan.ownerId != req.user.id) {
      throw new ErrorWithStatus('You are not authorized to update this meal plan', 403);
    }
    next();
  } catch (e) {
    next(e);
  }
};
