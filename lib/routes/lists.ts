import { type Response, type NextFunction, Router } from 'express';
import authenticate from '../middleware/authenticate.js';
import { List } from '../models/List.js';
import { AuthenticatedRequest, AuthenticatedReqParams } from '../types/extendedExpressTypes.js';
import { ErrorWithStatus } from '../types/errorTypes.js';
import listAuthorization from '../middleware/list-authorization.js';

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
  .get('/:id', [authenticate, listAuthorization], async (req: AuthenticatedReqParams<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const list = await List.findById(req.params.id);
      if (!list) throw new ErrorWithStatus('List not found', 404);
      res.json({
        message: 'List found',
        list
      });
    } catch (e) {
      next(e);
    }
  })
  .delete('/:id', [authenticate, listAuthorization], async (req: AuthenticatedReqParams<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const list = await List.findById(req.params.id);
      if (!list) throw new ErrorWithStatus('List not found', 404);
      const deletedList: List = await list.delete();
      res.json({
        message: 'List deleted successfully',
        list: deletedList
      });
    } catch (e) {
      next(e);
    }
  });

