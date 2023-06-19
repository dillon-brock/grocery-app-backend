import { NextFunction, Response } from 'express-serve-static-core';
import { AuthenticatedReqParams } from '../../../types/extendedExpress.js';
import { PlanShare } from '../../../models/PlanShare.js';
import { ErrorWithStatus } from '../../../types/error.js';
import { MealPlan } from '../../../models/MealPlan.js';

export default async (req: AuthenticatedReqParams<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const planShare = await PlanShare.findById(req.params.id);
    if (!planShare) {
      throw new ErrorWithStatus('Plan share not found', 404);
    }

    const mealPlan = await MealPlan.findById(planShare.planId);
    if (!mealPlan) {
      throw new ErrorWithStatus('Meal plan not found', 404);
    }

    if (mealPlan.ownerId != req.user.id) {
      throw new ErrorWithStatus('You are not authorized to modify the share settings of this meal plan', 403);
    }
    next();
  } catch (e) {
    next(e);
  }
};
