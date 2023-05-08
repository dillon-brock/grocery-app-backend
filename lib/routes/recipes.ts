import { Router } from 'express';
import authenticate from '../middleware/authenticate.js';
import { AuthenticatedReqBody, TypedResponse } from '../types/extendedExpress.js';
import { NewRecipeBody, RecipeRes } from '../types/recipe.js';
import { NextFunction } from 'express-serve-static-core';
import { Recipe } from '../models/Recipe.js';

export default Router()
  .post('/', authenticate, async(req: AuthenticatedReqBody<NewRecipeBody>, 
    res: TypedResponse<RecipeRes>, next: NextFunction) => {
    try {
      const newRecipe = await Recipe.create({ ...req.body, userId: req.user.id });
      res.json({
        message: 'Recipe created successfully',
        recipe: newRecipe
      });
    } catch (e) {
      next(e);
    }
  });
