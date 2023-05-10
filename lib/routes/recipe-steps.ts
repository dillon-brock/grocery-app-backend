import { Router } from 'express';
import authenticate from '../middleware/authenticate.js';
import { AuthReqBodyAndQuery, TypedResponse } from '../types/extendedExpress.js';
import { NewStepReqBody, RecipeStepRes } from '../types/recipe-step.js';
import { NextFunction } from 'express-serve-static-core';
import { RecipeStep } from '../models/RecipeStep.js';

export default Router()
  .post('/', authenticate, async (req: AuthReqBodyAndQuery<NewStepReqBody, { recipeId: string}>,
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
  });
