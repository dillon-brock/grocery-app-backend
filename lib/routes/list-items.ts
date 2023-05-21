import { Router } from 'express';
import authenticate from '../middleware/authenticate.js';
import { ListItem } from '../models/ListItem.js';
import { ErrorWithStatus } from '../types/error.js';
import { AuthReqBodyAndQuery, AuthenticatedReqParams, TypedAuthenticatedRequest, TypedResponse } from '../types/extendedExpress.js';
import { ListItemRes, ListItemUpdateData, NewListItemBody } from '../types/listItem.js';
import authorizeItemAccess from '../middleware/authorization/list-items/item-access.js';
import authorizeAddItem from '../middleware/authorization/list-items/add-item.js';
import { NextFunction } from 'express-serve-static-core';
import { MultipleItemsRes } from '../types/listItem.js';

export default Router()
  .post('/', [authenticate, authorizeAddItem], async (
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
  .post('/multiple', [authenticate], async (
    req: AuthReqBodyAndQuery<{ items: NewListItemBody[] }, { listId: string }>,
    res: TypedResponse<MultipleItemsRes>, next: NextFunction) => {
    try {
      const newItems = await ListItem.createMultiple(req.body.items, req.query.listId);
      res.json({ message: 'Items added successfully', listItems: newItems });
    } catch (e) {
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
