import { type Response, type NextFunction, Router } from 'express';
import authenticate from '../middleware/authenticate.js';
import { AuthenticatedRequest } from '../types/global.js';
import { ListItem } from '../models/ListItem.js';
import { ErrorWithStatus } from '../types/errorTypes.js';

export default Router()
  .post('/', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { listId, quantity, item } = req.body;
      const newItem = await ListItem.create({ listId, quantity, item });
      res.json({ message: 'Item added successfully', item: newItem });
    }
    catch (e) {
      next(e);
    }
  })
  .put('/:id', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.params.id) throw new ErrorWithStatus('Invalid params', 404);
      const item = await ListItem.findById(req.params.id);
      if (!item) throw new ErrorWithStatus('Not found', 404);

    } catch (e) {
      next(e);
    }
  });
