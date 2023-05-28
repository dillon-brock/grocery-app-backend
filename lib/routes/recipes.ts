import { Router } from 'express';
import authenticate from '../middleware/authenticate.js';
import { AuthenticatedReqBody, AuthenticatedReqParams, AuthenticatedRequest, TypedAuthenticatedRequest, TypedResponse } from '../types/extendedExpress.js';
import { MultipleRecipesRes, NewRecipeBody, RecipeRes } from '../types/recipe.js';
import { NextFunction } from 'express-serve-static-core';
import { Recipe, RecipeWithDetail } from '../models/Recipe.js';
import authorizeRecipeAccess from '../middleware/authorization/recipes/recipe-access.js';
import validateNewRecipe from '../middleware/validation/recipes/create.js';
import validateRecipeUpdate from '../middleware/validation/recipes/update.js';

export default Router()
  .post('/', [authenticate, validateNewRecipe], async (req: AuthenticatedReqBody<NewRecipeBody>, 
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
      const recipe = await RecipeWithDetail.findById(req.params.id);
      res.json({
        message: 'Recipe found',
        recipe
      });
    } catch (e) {
      next(e);
    }
  })
  .put('/:id', [authenticate, validateRecipeUpdate, authorizeRecipeAccess], async (
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
  })
  .delete('/:id', [authenticate, authorizeRecipeAccess], async (req: AuthenticatedReqParams<{id: string}>,
    res: TypedResponse<RecipeRes>, next: NextFunction) => {
    try {
      const deletedRecipe = await Recipe.deleteById(req.params.id);
      res.json({
        message: 'Recipe deleted successfully',
        recipe: deletedRecipe
      });
    } catch (e) {
      next(e);
    }
  }); 

