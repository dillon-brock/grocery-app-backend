import { Router } from 'express';
import authenticate from '../middleware/authenticate.js';
import { AuthenticatedReqBody, AuthenticatedReqParams, AuthenticatedReqQuery, TypedAuthenticatedRequest, TypedResponse } from '../types/extendedExpress.js';
import { MealPlanRes, MealPlanUpdateData, MealPlanWithRecipesRes, MultipleMealPlanWithRecipesRes } from '../types/mealPlan.js';
import { NextFunction } from 'express-serve-static-core';
import { MealPlan, MealPlanWithRecipes } from '../models/MealPlan.js';
import validateCreateMealPlan from '../middleware/validation/meal-plans/create.js';
import authorizeUpdateMealPlan from '../middleware/authorization/meal-plans/update.js';
import validateUpdateMealPlan from '../middleware/validation/meal-plans/update.js';

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
  .put('/:id', [authenticate, authorizeUpdateMealPlan, validateUpdateMealPlan],
    async (req: TypedAuthenticatedRequest<MealPlanUpdateData, { id: string }>, 
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
    })
  .get('/', authenticate, async (req: AuthenticatedReqQuery<{ startDate: string, endDate: string}>,
    res: TypedResponse<MultipleMealPlanWithRecipesRes>, next: NextFunction) => {
    try {
      const mealPlans = await MealPlanWithRecipes.findByDateRange(req.query.startDate, req.query.endDate, req.user.id);
      res.json({
        message: 'Meal plans found successfully',
        mealPlans
      });
    } catch (e) {
      next(e);
    }
  })
  .get('/:date', authenticate, async (req: AuthenticatedReqParams<{ date: string }>, 
    res: TypedResponse<MealPlanWithRecipesRes>, next: NextFunction) => {
    try {
      const planWithRecipes = await MealPlanWithRecipes.findByDate(req.params.date, req.user.id);
      res.json({
        message: 'Meal plan found successfully',
        mealPlan: planWithRecipes
      });
    } catch (e) {
      next(e);
    }
  });
