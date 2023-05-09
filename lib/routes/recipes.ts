import { Router } from 'express';
import authenticate from '../middleware/authenticate.js';
import { AuthenticatedReqBody, AuthenticatedReqParams, AuthenticatedRequest, TypedAuthenticatedRequest, TypedResponse } from '../types/extendedExpress.js';
import { MultipleRecipesRes, NewRecipeBody, RecipeRes } from '../types/recipe.js';
import { NextFunction } from 'express-serve-static-core';
import { Recipe } from '../models/Recipe.js';
import authorizeRecipeAccess from '../middleware/authorization/recipe-access.js';

export default Router()
  .post('/', authenticate, async (req: AuthenticatedReqBody<NewRecipeBody>, 
    res: TypedResponse<RecipeRes>, next: NextFunction) => {
    try {
      const newRecipe = await Recipe.create({ ...req.body, ownerId: req.user.id });
      res.json({
        message: 'Recipe created successfully',
        recipe: newRecipe
      });
    } catch (e) {
      next(e);
    }
  })
  .get('/', authenticate, async (req: AuthenticatedRequest, 
    res: TypedResponse<MultipleRecipesRes>, next: NextFunction) => {
    try {
      const recipes = await Recipe.findByUserId(req.user.id);
      res.json({
        message: 'Recipes found',
        recipes
      });
    } catch (e) {
      next(e);
    }
  })
  .get('/:id', [authenticate, authorizeRecipeAccess], async (req: AuthenticatedReqParams<{id: string}>, 
    res: TypedResponse<RecipeRes>, next: NextFunction) => {
    try {
      const recipe = await Recipe.findById(req.params.id);
      res.json({
        message: 'Recipe found',
        recipe
      });
    } catch (e) {
      next(e);
    }
  })
  .put('/:id', [authenticate, authorizeRecipeAccess], async (
    req: TypedAuthenticatedRequest<{}, {id: string}>,
    res: TypedResponse<RecipeRes>, next: NextFunction) => {
    try {
      const updatedRecipe = await Recipe.updateById(req.params.id, req.body);
      res.json({
        message: 'Recipe updated successfully',
        recipe: updatedRecipe
      });
    } catch (e) {
      next(e);
    }
  });

