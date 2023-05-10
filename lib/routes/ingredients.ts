import { Router } from 'express';
import authenticate from '../middleware/authenticate.js';
import { AuthenticatedReqBody, TypedAuthenticatedRequest, TypedResponse } from '../types/extendedExpress.js';
import { IngredientRes, IngredientUpdateData, NewIngredientData } from '../types/ingredient.js';
import { NextFunction } from 'express-serve-static-core';
import { Ingredient } from '../models/Ingredient.js';
import authorizeModifyRecipeDetails from '../middleware/authorization/modify-recipe-details.js';
import authorizeEditIngredient from '../middleware/authorization/edit-ingredient.js';

export default Router()
  .post('/', [authenticate, authorizeModifyRecipeDetails], async (req: AuthenticatedReqBody<NewIngredientData>, 
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
  .put('/:id', [authenticate, authorizeEditIngredient], async (req: TypedAuthenticatedRequest<IngredientUpdateData, { id: string }>,
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
