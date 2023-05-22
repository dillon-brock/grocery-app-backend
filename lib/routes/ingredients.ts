import { Router } from 'express';
import authenticate from '../middleware/authenticate.js';
import { AuthReqBodyAndQuery, AuthenticatedReqParams, AuthenticatedReqQuery, TypedAuthenticatedRequest, TypedResponse } from '../types/extendedExpress.js';
import { IngredientRes, IngredientUpdateData, MultipleIngredientRes, NewIngredientData } from '../types/ingredient.js';
import { NextFunction } from 'express-serve-static-core';
import { Ingredient } from '../models/Ingredient.js';
import authorizeModifyRecipeDetails from '../middleware/authorization/recipes/modify-recipe-details.js';
import authorizeEditIngredient from '../middleware/authorization/ingredients/edit-ingredient.js';
import authorizeViewRecipe from '../middleware/authorization/recipes/view-from-query.js';
import validateCreateIngredient from '../middleware/validation/ingredients/create-ingredient.js';

export default Router()
  .post('/', [authenticate, validateCreateIngredient, authorizeModifyRecipeDetails], async (
    req: AuthReqBodyAndQuery<NewIngredientData, { recipeId: string }>, 
    res: TypedResponse<IngredientRes>, next: NextFunction) => {
    try {
      const newIngredient = await Ingredient.create({ ...req.body, recipeId: req.query.recipeId });
      res.json({
        message: 'Ingredient added successfully',
        ingredient: newIngredient
      });
    } catch (e) {
      next(e);
    }
  })
  .get('/', [authenticate, authorizeViewRecipe], async (req: AuthenticatedReqQuery<{ recipeId: string }>, 
    res: TypedResponse<MultipleIngredientRes>, next: NextFunction) => {
    try {
      const ingredients = await Ingredient.findByRecipeId(req.query.recipeId);
      res.json({
        message: 'Ingredients found',
        ingredients
      });
    } catch (e) {
      next(e);
    }
  })
  .put('/:id', [authenticate, authorizeEditIngredient], async (
    req: TypedAuthenticatedRequest<IngredientUpdateData, { id: string }>,
    res: TypedResponse<IngredientRes>, next: NextFunction) => {
    try {
      const updatedIngredient = await Ingredient.updateById(req.params.id, req.body);
      res.json({
        message: 'Ingredient updated successfully',
        ingredient: updatedIngredient
      });
    } catch (e) {
      next(e);
    }
  })
  .delete('/:id', [authenticate, authorizeEditIngredient], async (
    req: AuthenticatedReqParams<{id: string}>, res: TypedResponse<IngredientRes>,
    next: NextFunction) => {
    try {
      const deletedIngredient = await Ingredient.deleteById(req.params.id);
      res.json({
        message: 'Ingredient deleted successfully',
        ingredient: deletedIngredient
      });
    } catch (e) {
      next(e);
    }
  });
