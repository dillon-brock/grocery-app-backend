import { NextFunction, Response } from 'express-serve-static-core';
import { AuthenticatedReqBody } from '../../../types/extendedExpress.js';
import { NewPlanShareData } from '../../../types/planShare.js';
import { MealPlan } from '../../../models/MealPlan.js';
import { ErrorWithStatus } from '../../../types/error.js';

export default async (req: AuthenticatedReqBody<NewPlanShareData>, res: Response, next: NextFunction) => {
  try {
    const { planId } = req.body;
    const mealPlan = await MealPlan.findById(planId);
    if (!mealPlan) {
      throw new ErrorWithStatus('Meal plan not found', 404);
    }

    if (mealPlan.ownerId != req.user.id) {
      throw new ErrorWithStatus('You are not authorized to share this meal plan', 403);
    }
    next();
  } catch (e) {
    next(e);
  }
};
