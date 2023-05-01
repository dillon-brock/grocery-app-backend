import { type Response, type NextFunction, Router } from 'express';
import authenticate from '../middleware/authenticate.js';
import { List } from '../models/List.js';
import { AuthenticatedReqBody, AuthenticatedRequest, TypedAuthenticatedRequest } from '../types/extendedExpressTypes.js';
import findListAndAuthorize from '../middleware/find-list-and-authorize.js';
import { NewListData } from '../types/listTypes.js';

export default Router()
  .post('/', authenticate, async (req: AuthenticatedReqBody<NewListData>, res: Response, next: NextFunction) => {
    try {
      const newList: List = await List.create({ ...req.body, ownerId: req.user.id });
      res.json({ 
        message: 'List successfully created',
        list: newList
      });
    } catch (e) {
      next(e);
    }
  })
  .get('/', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const lists: List[] = await List.findAllByOwnerId(req.user.id);
      res.json({
        message: 'User\'s lists found',
        lists
      });
    } catch (e) {
      next(e);
    }
  })
  .get('/:id', [authenticate, findListAndAuthorize], async (req: TypedAuthenticatedRequest<{ list: List}, { id: string }>, res: Response, next: NextFunction) => {
    try {
      const { list } = req.body;
      res.json({
        message: 'List found',
        list
      });
    } catch (e) {
      next(e);
    }
  })
  .delete('/:id', [authenticate, findListAndAuthorize], async (req: TypedAuthenticatedRequest<{ list: List }, { id: string }>, res: Response, next: NextFunction) => {
    try {
      const { list } = req.body;
      const deletedList: List = await list.delete();
      res.json({
        message: 'List deleted successfully',
        list: deletedList
      });
    } catch (e) {
      next(e);
    }
  });

