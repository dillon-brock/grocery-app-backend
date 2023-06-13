import { Router } from 'express';
import authenticate from '../middleware/authenticate.js';
import { AuthenticatedReqBody, TypedAuthenticatedRequest, TypedResponse } from '../types/extendedExpress.js';
import { MealPlanRes, MealPlanUpdateData } from '../types/mealPlan.js';
import { NextFunction } from 'express-serve-static-core';
import { MealPlan } from '../models/MealPlan.js';
import validateCreateMealPlan from '../middleware/validation/meal-plans/create.js';
import authorizeUpdateMealPlan from '../middleware/authorization/meal-plans/update.js';

export default Router()
  .post('/', [authenticate, validateCreateMealPlan], async (req: AuthenticatedReqBody<{ date: string }>, res: TypedResponse<MealPlanRes>, next: NextFunction) => {
    try {
      const mealPlan = await MealPlan.create({ ...req.body, ownerId: req.user.id });
      res.json({
        message: 'Meal plan created successfully',
        mealPlan
      });
    } catch (e) {
      next(e);
    }
  })
  .put('/:id', [authenticate, authorizeUpdateMealPlan], async (req: TypedAuthenticatedRequest<MealPlanUpdateData, { id: string }>, 
    res: TypedResponse<MealPlanRes>, next: NextFunction) => {
    try {
      const mealPlan = await MealPlan.updateById(req.params.id, req.body);
      res.json({
        message: 'Meal plan updated successfully',
        mealPlan
      });
    } catch (e) {
      next(e);
    }
  });
