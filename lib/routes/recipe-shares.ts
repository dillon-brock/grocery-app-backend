import { Router } from 'express';
import authenticate from '../middleware/authenticate.js';
import { AuthenticatedReqBody, AuthenticatedReqParams, AuthenticatedReqQuery, AuthenticatedRequest, TypedAuthenticatedRequest, TypedResponse } from '../types/extendedExpress.js';
import { NextFunction } from 'express-serve-static-core';
import { NewRecipeShareData, RecipeShareRes, RecipeShareUpdateData } from '../types/recipeShare.js';
import { RecipeShare } from '../models/RecipeShare.js';
import { MultipleRecipesRes } from '../types/recipe.js';
import authorizeRecipeShare from '../middleware/authorization/share-recipe.js';
import { MultipleUserRes } from '../types/user.js';
import authorizeGetSharedUsers from '../middleware/authorization/get-users-with-recipe-access.js';
import authorizeUpdateRecipeShare from '../middleware/authorization/update-recipe-share.js';

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
  })
  .get('/users', [authenticate, authorizeGetSharedUsers], async (req: AuthenticatedReqQuery<{ recipeId: string }>,
    res: TypedResponse<MultipleUserRes>, next: NextFunction) => {
    try {
      const sharedUsers = await RecipeShare.findUsersByRecipeId(req.query.recipeId);
      res.json({
        message: 'Shared users found',
        users: sharedUsers
      });
    } catch (e) {
      next(e);
    }
  })
  .put('/:id', [authenticate, authorizeUpdateRecipeShare], async (
    req: TypedAuthenticatedRequest<RecipeShareUpdateData, { id: string }>,
    res: TypedResponse<RecipeShareRes>, next: NextFunction) => {
    try {
      const updatedRecipeShare = await RecipeShare.updateById(req.params.id, req.body);
      res.json({
        message: 'Recipe share updated successfully',
        recipeShare: updatedRecipeShare
      });
    } catch (e) {
      next(e);
    }
  })
  .delete('/:id', [authenticate, authorizeUpdateRecipeShare], async (
    req: AuthenticatedReqParams<{ id: string }>,
    res: TypedResponse<RecipeShareRes>, next: NextFunction) => {
    try {
      const deletedRecipeShare = await RecipeShare.deleteById(req.params.id);
      res.json({
        message: 'Recipe share deleted successfully',
        recipeShare: deletedRecipeShare
      });
    } catch (e) {
      next(e);
    }
  });
