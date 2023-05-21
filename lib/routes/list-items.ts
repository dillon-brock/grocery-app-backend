import { Router } from 'express';
import authenticate from '../middleware/authenticate.js';
import { ListItem } from '../models/ListItem.js';
import { ErrorWithStatus } from '../types/error.js';
import { AuthReqBodyAndQuery, AuthenticatedReqBody, AuthenticatedReqParams, TypedAuthenticatedRequest, TypedResponse } from '../types/extendedExpress.js';
import { ListItemRes, ListItemUpdateData, NewListItemBody, NewListItemData } from '../types/listItem.js';
import authorizeItemAccess from '../middleware/authorization/list-items/item-access.js';
import authorizeEditList from '../middleware/authorization/lists/edit-list.js';
import { NextFunction } from 'express-serve-static-core';

export default Router()
  .post('/', [authenticate, authorizeEditList], async (
    req: AuthReqBodyAndQuery<NewListItemBody, { listId: string }>, 
    res: TypedResponse<ListItemRes>, next: NextFunction) => {
    try {
      const newItem = await ListItem.create({ ...req.body, listId: req.query.listId });
      res.json({ message: 'Item added successfully', listItem: newItem });
    }
    catch (e) {
      next(e);
    }
  })
  .put('/:id', [authenticate, authorizeItemAccess], async (
    req: TypedAuthenticatedRequest<ListItemUpdateData, {id: string}>, 
    res: TypedResponse<ListItemRes>, next: NextFunction) => {
    try {
      const listItem = await ListItem.findById(req.params.id);
      if (!listItem) {
        throw new ErrorWithStatus('List item not found', 404);
      }
      const updatedItem = await listItem.update(req.body);

      res.json({
        message: 'Item updated successfully',
        listItem: updatedItem
      });
    } catch (e) {
      next(e);
    }
  })
  .delete('/:id', [authenticate, authorizeItemAccess], async (
    req: AuthenticatedReqParams<{id: string}>, 
    res: TypedResponse<ListItemRes>, next: NextFunction) => {
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
