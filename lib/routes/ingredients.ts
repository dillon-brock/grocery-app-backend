import { Router } from 'express';
import authenticate from '../middleware/authenticate.js';
import { AuthenticatedReqBody, TypedResponse } from '../types/extendedExpress.js';
import { IngredientRes, NewIngredientData } from '../types/ingredient.js';
import { NextFunction } from 'express-serve-static-core';
import { Ingredient } from '../models/Ingredient.js';

export default Router()
  .post('/', authenticate, async (req: AuthenticatedReqBody<NewIngredientData>, 
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
  });
