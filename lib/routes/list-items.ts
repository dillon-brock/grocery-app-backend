import { type Response, type NextFunction, Router } from 'express';
import authenticate from '../middleware/authenticate.js';
import { AuthenticatedRequest } from '../../types.js';
import { ListItem } from '../models/ListItem.js';

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
  });
