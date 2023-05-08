import { Router } from 'express';
import authenticate from '../middleware/authenticate.js';
import { AuthenticatedReqBody, TypedResponse } from '../types/extendedExpress.js';
import { NextFunction } from 'express-serve-static-core';
import { NewRecipeShareData, RecipeShareRes } from '../types/recipeShare.js';
import { RecipeShare } from '../models/RecipeShare.js';

export default Router()
  .post('/', authenticate, async (req: AuthenticatedReqBody<NewRecipeShareData>, 
    res: TypedResponse<RecipeShareRes>, next: NextFunction) => {
    try {
      const newShare = await RecipeShare.create(req.body);
      res.json({
        message: 'Recipe shared successfully',
        recipeShare: newShare
      });
    } catch (e) {
      next(e);
    }
  });
