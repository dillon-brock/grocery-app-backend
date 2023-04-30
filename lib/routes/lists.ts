import { type Response, type NextFunction, Router } from 'express';
import authenticate from '../middleware/authenticate.js';
import { List } from '../models/List.js';
import { ErrorWithStatus } from '../types/errorTypes.js';
import { AuthenticatedRequest } from '../types/extendedExpressTypes.js';

export default Router()
  .post('/', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const newList: List = await List.create(req.user.id);
      res.json({ 
        message: 'List successfully created',
        list: newList
      });
    } catch (e) {
      next(e);
    }
  })
  .get('/:id', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.params.id) throw new ErrorWithStatus('Invalid params', 404);
      const list = await List.findById(req.params.id);
      res.json({
        message: 'List found',
        list
      });
    } catch (e) {
      next(e);
    }
  });

