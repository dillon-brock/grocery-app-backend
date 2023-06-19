import { NextFunction, Response } from 'express-serve-static-core';
import { AuthenticatedRequest } from '../../../types/extendedExpress.js';
import { MealPlan } from '../../../models/MealPlan.js';
import { ErrorWithStatus } from '../../../types/error.js';

export default async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { planId } = req.query;
    const mealPlan = await MealPlan.findById(planId as string);

    if (!mealPlan) {
      throw new ErrorWithStatus('Meal plan not found', 404);
    }
    if (mealPlan.ownerId != req.user.id) {
      throw new ErrorWithStatus('You are not authorized to view this information', 403);
    }
    next();
  } catch (e) {
    next(e);
  }
};
