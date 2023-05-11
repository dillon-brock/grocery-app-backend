import { Router } from 'express';
import authenticate from '../middleware/authenticate.js';
import { AuthReqBodyAndQuery, AuthenticatedReqQuery, TypedAuthenticatedRequest, TypedResponse } from '../types/extendedExpress.js';
import { MultipleStepRes, NewStepReqBody, RecipeStepRes, StepUpdateData } from '../types/recipe-step.js';
import { NextFunction } from 'express-serve-static-core';
import { RecipeStep } from '../models/RecipeStep.js';
import authorizeModifyRecipeDetails from '../middleware/authorization/recipes/modify-recipe-details.js';
import authorizeEditStep from '../middleware/authorization/recipe-steps/edit-step.js';
import authorizeViewRecipe from '../middleware/authorization/recipes/view-from-query.js';

export default Router()
  .post('/', [authenticate, authorizeModifyRecipeDetails], async (
    req: AuthReqBodyAndQuery<NewStepReqBody, { recipeId: string }>,
    res: TypedResponse<RecipeStepRes>, next: NextFunction) => {
    try {
      const newStep = await RecipeStep.create({ ...req.body, recipeId: req.query.recipeId });
      res.json({ 
        message: 'Step added successfully',
        step: newStep
      });
    } catch (e) {
      next(e);
    }
  })
  .get('/', [authenticate, authorizeViewRecipe], async (req: AuthenticatedReqQuery<{ recipeId: string }>,
    res: TypedResponse<MultipleStepRes>, next: NextFunction) => {
    try {
      const steps = await RecipeStep.findByRecipeId(req.query.recipeId);
      res.json({
        message: 'Steps found',
        steps
      });
    } catch (e) {
      next(e);
    }
  })
  .put('/:id', [authenticate, authorizeEditStep], async (
    req: TypedAuthenticatedRequest<StepUpdateData, { id: string }>,
    res: TypedResponse<RecipeStepRes>, next: NextFunction) => {
    try {
      const updatedStep = await RecipeStep.updateById(req.params.id, req.body);
      res.json({
        message: 'Step updated successfully',
        step: updatedStep
      });
    } catch (e) {
      next(e);
    }
  });

