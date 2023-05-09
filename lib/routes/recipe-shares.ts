import { Router } from 'express';
import authenticate from '../middleware/authenticate.js';
import { AuthenticatedReqBody, AuthenticatedRequest, TypedResponse } from '../types/extendedExpress.js';
import { NextFunction } from 'express-serve-static-core';
import { NewRecipeShareData, RecipeShareRes } from '../types/recipeShare.js';
import { RecipeShare } from '../models/RecipeShare.js';
import { MultipleRecipesRes } from '../types/recipe.js';
import authorizeRecipeShare from '../middleware/authorization/recipe-share.js';

export default Router()
  .post('/', [authenticate, authorizeRecipeShare], async (req: AuthenticatedReqBody<NewRecipeShareData>, 
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
  })
  .get('/recipes', authenticate, async (req: AuthenticatedRequest, 
    res: TypedResponse<MultipleRecipesRes>, next: NextFunction) => {
    try {
      const sharedRecipes = await RecipeShare.findRecipesByUserId(req.user.id);
      res.json({
        message: 'Shared recipes found',
        recipes: sharedRecipes
      });
    } catch (e) {
      next(e);
    }
  });
