import { Router } from 'express';
import authenticate from '../middleware/authenticate.js';
import { AuthenticatedReqBody, TypedAuthenticatedRequest, TypedResponse } from '../types/extendedExpress.js';
import { NewPlanRecipeData, PlanRecipeRes, PlanRecipeUpdateData } from '../types/planRecipe.js';
import { NextFunction } from 'express-serve-static-core';
import { PlanRecipe } from '../models/PlanRecipe.js';
import authorizeAddRecipe from '../middleware/authorization/plans-recipes/add-recipe.js';
import validateCreatePlanRecipe from '../middleware/validation/plans-recipes/create.js';
import validateUpdatePlanRecipe from '../middleware/validation/plans-recipes/update.js';
import authorizeUpdatePlanRecipe from '../middleware/authorization/plans-recipes/update.js';

export default Router()
  .post('/', [authenticate, validateCreatePlanRecipe, authorizeAddRecipe], async (req: AuthenticatedReqBody<NewPlanRecipeData>, res: TypedResponse<PlanRecipeRes>, next: NextFunction) => {
    try {
      const planRecipe = await PlanRecipe.create(req.body);
      res.json({
        message: 'Plan recipe created successfully',
        planRecipe
      });
    } catch (e) {
      next(e);
    }
  })
  .put('/:id', [authenticate, validateUpdatePlanRecipe, authorizeUpdatePlanRecipe], async (req: TypedAuthenticatedRequest<PlanRecipeUpdateData, { id: string }>, 
    res: TypedResponse<PlanRecipeRes>, next: NextFunction) => {
    try {
      const planRecipe = await PlanRecipe.updateById(req.params.id, req.body);
      res.json({
        message: 'Plan recipe updated successfully',
        planRecipe
      });
    } catch (e) {
      next(e);
    }
  });
