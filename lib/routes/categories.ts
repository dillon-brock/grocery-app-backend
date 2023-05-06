import { Router } from 'express';
import authenticate from '../middleware/authenticate.js';
import { AuthenticatedReqBody, AuthenticatedReqParams, TypedAuthenticatedRequest, TypedResponse } from '../types/extendedExpress.js';
import { Category } from '../models/Category.js';
import { CategoryRes, NewCategoryData } from '../types/category.js';
import authorizeEditList from '../middleware/authorization/edit-list.js';
import { NextFunction } from 'express-serve-static-core';
import authorizeCategoryAccess from '../middleware/authorization/category-access.js';

export default Router()
  .post('/', [authenticate, authorizeEditList], async (
    req: AuthenticatedReqBody<NewCategoryData>, 
    res: TypedResponse<CategoryRes>, next: NextFunction) => {
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
  .put('/:id', [authenticate, authorizeCategoryAccess], async (
    req: TypedAuthenticatedRequest<{ name: string}, { id: string }>, 
    res: TypedResponse<CategoryRes>, next: NextFunction) => {
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
  })
  .delete('/:id', [authenticate, authorizeCategoryAccess], async (
    req: AuthenticatedReqParams<{ id: string }>, 
    res: TypedResponse<CategoryRes>, next: NextFunction) => {
    try {
      const deletedCategory = await Category.deleteById(req.params.id);
      res.json({
        message: 'Category deleted successfully',
        category: deletedCategory
      });
    } catch (e) {
      next(e);
    }
  });
