import { Router } from 'express';
import authenticate from '../middleware/authenticate.js';
import { AuthenticatedReqBody, TypedResponse } from '../types/extendedExpress.js';
import { MealPlanRes } from '../types/mealPlan.js';
import { NextFunction } from 'express-serve-static-core';
import { MealPlan } from '../models/MealPlan.js';

export default Router()
  .post('/', authenticate, async (req: AuthenticatedReqBody<{ date: string }>, res: TypedResponse<MealPlanRes>, next: NextFunction) => {
    try {
      const mealPlan = await MealPlan.create({ ...req.body, ownerId: req.user.id });
      res.json({
        message: 'Meal plan created successfully',
        mealPlan
      });
    } catch (e) {
      next(e);
    }
  });
