import { Router } from 'express';
import authenticate from '../middleware/authenticate.js';
import { AuthenticatedReqBody } from '../types/extendedExpress.js';
import { Category } from '../models/Category.js';
import { NewCategoryData } from '../types/category.js';

export default Router()
  .post('/', authenticate, async (req: AuthenticatedReqBody<NewCategoryData>, res, next) => {
    try {
      const newCategory = await Category.create(req.body);
      res.json({
        message: 'Category created successfully',
        category: newCategory
      });
    } catch (e) {
      next(e);
    }
  });
