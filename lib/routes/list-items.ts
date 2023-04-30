import { type Response, type NextFunction, Router } from 'express';
import authenticate from '../middleware/authenticate.js';
import { ListItem } from '../models/ListItem.js';
import { ErrorWithStatus } from '../types/errorTypes.js';
import { AuthenticatedReqBody, TypedAuthenticatedRequest } from '../types/extendedExpressTypes.js';
import { ListItemUpdateData, NewListItemData } from '../types/listItemTypes.js';

export default Router()
  .post('/', authenticate, async (req: AuthenticatedReqBody<NewListItemData>, res: Response, next: NextFunction) => {
    try {
      const { listId, quantity, item } = req.body;
      const newItem = await ListItem.create({ listId, quantity, item });
      res.json({ message: 'Item added successfully', item: newItem });
    }
    catch (e) {
      next(e);
    }
  })
  .put('/:id', authenticate, async (
    req: TypedAuthenticatedRequest<ListItemUpdateData, {id: string}>, 
    res: Response, next: NextFunction) => {
    try {
      const item = await ListItem.findById(req.params.id);
      if (!item) throw new ErrorWithStatus('Not found', 404);
      const updatedList = await item.update(req.body);
      res.json({
        message: 'Item updated successfully',
        item: updatedList
      });
    } catch (e) {
      next(e);
    }
  });
