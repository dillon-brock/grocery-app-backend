import { Router } from 'express';
import authenticate from '../middleware/authenticate.js';
import { AuthenticatedReqBody } from '../types/extendedExpress.js';
import { Category } from '../models/Category.js';

export default Router()
  .post('/', authenticate, async (req: AuthenticatedReqBody<{ name: string }>, res, next) => {
    try {
      const newCategory = await Category.create({ 
        name: req.body.name, 
        userId: req.user.id 
      });
      res.json({
        message: 'Category created successfully',
        category: newCategory
      });
    } catch (e) {
      next(e);
    }
  });
