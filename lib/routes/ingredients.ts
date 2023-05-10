import { Router } from 'express';
import authenticate from '../middleware/authenticate.js';
import { AuthenticatedReqBody, AuthenticatedReqQuery, TypedAuthenticatedRequest, TypedResponse } from '../types/extendedExpress.js';
import { IngredientRes, IngredientUpdateData, MultipleIngredientRes, NewIngredientData } from '../types/ingredient.js';
import { NextFunction } from 'express-serve-static-core';
import { Ingredient } from '../models/Ingredient.js';
import authorizeModifyRecipeDetails from '../middleware/authorization/modify-recipe-details.js';
import authorizeEditIngredient from '../middleware/authorization/edit-ingredient.js';

export default Router()
  .post('/', [authenticate, authorizeModifyRecipeDetails], async (
    req: AuthenticatedReqBody<NewIngredientData>, 
    res: TypedResponse<IngredientRes>, next: NextFunction) => {
    try {
      const newIngredient = await Ingredient.create(req.body);
      res.json({
        message: 'Ingredient added successfully',
        ingredient: newIngredient
      });
    } catch (e) {
      next(e);
    }
  })
  .get('/', authenticate, async (req: AuthenticatedReqQuery<{ recipeId: string }>, 
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
  });
