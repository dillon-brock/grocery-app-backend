import { type Response, type NextFunction, Router } from 'express';
import authenticate from '../middleware/authenticate.js';
import { ListItem } from '../models/ListItem.js';
import { ErrorWithStatus } from '../types/errorTypes.js';
import { AuthenticatedReqBody, AuthenticatedReqParams, TypedAuthenticatedRequest } from '../types/extendedExpressTypes.js';
import { ListItemUpdateData, NewListItemData } from '../types/listItemTypes.js';
import authorizeItemAccess from '../middleware/authorize-item-access.js';
import authorizeAddItem from '../middleware/authorize-add-item.js';

export default Router()
  .post('/', [authenticate, authorizeAddItem], async (req: AuthenticatedReqBody<NewListItemData>, res: Response, next: NextFunction) => {
    try {
      const { listId, quantity, item } = req.body;
      const newItem = await ListItem.create({ listId, quantity, item });
      res.json({ message: 'Item added successfully', item: newItem });
    }
    catch (e) {
      next(e);
    }
  })
  .put('/:id', [authenticate, authorizeItemAccess], async (
    req: TypedAuthenticatedRequest<ListItemUpdateData, {id: string}>, 
    res: Response, next: NextFunction) => {
    try {
      const listItem = await ListItem.findById(req.params.id);
      const updatedItem = await listItem?.update(req.body);
      res.json({
        message: 'Item updated successfully',
        item: updatedItem
      });
    } catch (e) {
      next(e);
    }
  })
  .delete('/:id', [authenticate, authorizeItemAccess], async (req: AuthenticatedReqParams<{id: string}>, res: Response, next: NextFunction) => {
    try {
      const listItem = await ListItem.findById(req.params.id);
      if (!listItem) throw new ErrorWithStatus('Item not found', 404);
      const deletedItem = await listItem.delete();
      res.json({
        message: 'Item deleted successfully',
        listItem: deletedItem
      });
    } catch (e) {
      next(e);
    }
  });
