import { Router } from 'express';
import authenticate from '../middleware/authenticate.js';
import { AuthenticatedReqBody, TypedResponse } from '../types/extendedExpress.js';
import { NewPlanRecipeData, PlanRecipeRes } from '../types/planRecipe.js';
import { NextFunction } from 'express-serve-static-core';
import { PlanRecipe } from '../models/PlanRecipe.js';

export default Router()
  .post('/', authenticate, async (req: AuthenticatedReqBody<NewPlanRecipeData>, res: TypedResponse<PlanRecipeRes>, next: NextFunction) => {
    try {
      const planRecipe = await PlanRecipe.create(req.body);
      res.json({
        message: 'Plan recipe created successfully',
        planRecipe
      });
    } catch (e) {
      next(e);
    }
  });
