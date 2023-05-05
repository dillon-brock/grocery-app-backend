import { Router } from 'express';
import authenticate from '../middleware/authenticate.js';
import { AuthenticatedReqBody, TypedAuthenticatedRequest } from '../types/extendedExpress.js';
import { Category } from '../models/Category.js';
import { NewCategoryData } from '../types/category.js';
import authorizeEditList from '../middleware/authorization/edit-list.js';
import { NextFunction, Response } from 'express-serve-static-core';

export default Router()
  .post('/', [authenticate, authorizeEditList], async (req: AuthenticatedReqBody<NewCategoryData>, res: Response, next: NextFunction) => {
    try {
      const newCategory = await Category.create(req.body);
      res.json({
        message: 'Category created successfully',
        category: newCategory
      });
    } catch (e) {
      next(e);
    }
  })
  .put('/:id', async (req: TypedAuthenticatedRequest<{ name: string}, { id: string }>, res: Response, next: NextFunction) => {
    try {
      const updatedCategory = await Category.updateNameById({ 
        id: req.params.id, 
        name: req.body.name 
      });
      res.json({
        message: 'Category updated successfully',
        category: updatedCategory
      });
    } catch (e) {
      next(e);
    }
  });
