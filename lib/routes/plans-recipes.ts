import { Router } from 'express';
import authenticate from '../middleware/authenticate.js';
import { AuthenticatedReqBody, AuthenticatedReqParams, TypedAuthenticatedRequest, TypedResponse } from '../types/extendedExpress.js';
import { NewPlanRecipeData, PlanRecipeRes, PlanRecipeUpdateData } from '../types/planRecipe.js';
import { NextFunction } from 'express-serve-static-core';
import { PlanRecipe } from '../models/PlanRecipe.js';
import authorizeAddRecipe from '../middleware/authorization/plans-recipes/add-recipe.js';
import validateCreatePlanRecipe from '../middleware/validation/plans-recipes/create.js';
import validateUpdatePlanRecipe from '../middleware/validation/plans-recipes/update.js';
import authorizeEditMealPlan from '../middleware/authorization/plans-recipes/edit-plan.js';
import authorizeUpdatePlanRecipe from '../middleware/authorization/plans-recipes/update-recipeId.js';

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
  .put('/:id', [authenticate, validateUpdatePlanRecipe, authorizeEditMealPlan, authorizeUpdatePlanRecipe],
    async (req: TypedAuthenticatedRequest<PlanRecipeUpdateData, { id: string }>, 
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
    })
  .delete('/:id', authenticate, async (req: AuthenticatedReqParams<{ id: string}>, res: TypedResponse<PlanRecipeRes>, next: NextFunction) => {
    try {
      const planRecipe = await PlanRecipe.deleteById(req.params.id);
      res.json({
        message: 'Plan recipe deleted successfully',
        planRecipe
      });
    } catch (e) {
      next();
    }
  });
