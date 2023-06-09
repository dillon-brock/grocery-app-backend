import { Router } from 'express';
import authenticate from '../middleware/authenticate.js';
import { AuthenticatedReqBody, AuthenticatedReqParams, AuthenticatedReqQuery, AuthenticatedRequest, TypedAuthenticatedRequest, TypedResponse } from '../types/extendedExpress.js';
import { NextFunction } from 'express-serve-static-core';
import { NewRecipeShareData, RecipeShareRes, RecipeShareUpdateData } from '../types/recipeShare.js';
import { RecipeShare } from '../models/RecipeShare.js';
import { MultipleRecipesRes } from '../types/recipe.js';
import authorizeRecipeShare from '../middleware/authorization/recipe-shares/share-recipe.js';
import { MultipleUserRes } from '../types/user.js';
import authorizeGetSharedUsers from '../middleware/authorization/recipe-shares/get-users-with-recipe-access.js';
import authorizeUpdateRecipeShare from '../middleware/authorization/recipe-shares/update-recipe-share.js';
import validateNewRecipeShare from '../middleware/validation/recipe-shares/create.js';
import validateUpdateRecipeShare from '../middleware/validation/shares/update.js';

export default Router()
  .post('/', [authenticate, validateNewRecipeShare, authorizeRecipeShare], async (req: AuthenticatedReqBody<NewRecipeShareData>, 
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
  .put('/:id', [authenticate, validateUpdateRecipeShare, authorizeUpdateRecipeShare], async (
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
