import { type Response, type NextFunction, Router } from 'express';
import authenticate from '../middleware/authenticate.js';
import { AuthenticatedRequest } from '../../types.js';
import { List } from '../models/List.js';

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
  .get('/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    
  });

