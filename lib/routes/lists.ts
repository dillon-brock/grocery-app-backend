import { Router } from 'express';
import authenticate from '../middleware/authenticate.js';
import { List, ListWithItems } from '../models/List.js';
import { AuthenticatedReqBody, AuthenticatedReqParams, AuthenticatedRequest, TypedAuthenticatedRequest, TypedResponse } from '../types/extendedExpress.js';
import authorizeListAccess from '../middleware/authorization/lists/list-access.js';
import authorizeUpdateList from '../middleware/authorization/lists/update-list.js';
import { ListRes, ListUpdateData, MultipleListsRes, NewListData } from '../types/list.js';
import { NextFunction } from 'express-serve-static-core';
import { Category } from '../models/Category.js';
import { ErrorWithStatus } from '../types/error.js';
import validateUpdateData from '../middleware/validation/update-list.js';

const defaultCategories: string[] = ['Fruit', 'Vegetables', 'Dry Goods', 
  'Canned Goods', 'Protein', 'Dairy', 'Beverages', 'Snacks'];

export default Router()
  .post('/', authenticate, async (
    req: AuthenticatedReqBody<NewListData>, 
    res: TypedResponse<ListRes>, next: NextFunction) => {
    try {
      const newList: List = await List.create({ ...req.body, ownerId: req.user.id });
      const listId = newList.id;
      await Promise.all(defaultCategories.map(category => (
        Category.create({ name: category, listId }))));
      
      res.json({ 
        message: 'List successfully created',
        list: newList
      });
    } catch (e) {
      next(e);
    }
  })
  .get('/', authenticate, async (req: AuthenticatedRequest, 
    res: TypedResponse<MultipleListsRes>, next: NextFunction) => {
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
  .get('/:id', [authenticate, authorizeListAccess], async (
    req: AuthenticatedReqParams<{ id: string }>, 
    res: TypedResponse<ListRes>, next: NextFunction) => {
    try {
      const list = await ListWithItems.findById(req.params.id);
      if (!list) throw new ErrorWithStatus('List not found', 404);
      res.json({
        message: 'List found',
        list
      });
    } catch (e) {
      next(e);
    }
  })
  .put('/:id', [authenticate, validateUpdateData, authorizeUpdateList], async (req: TypedAuthenticatedRequest<ListUpdateData, { id: string}>,
    res: TypedResponse<ListRes>, next: NextFunction) => {
    try {
      const updatedList = await List.updateById(req.params.id, req.body);
      res.json({
        message: 'List updated successfully',
        list: updatedList
      });
    }
    catch (e) {
      next(e);
    }
  })
  .delete('/:id', [authenticate, authorizeListAccess], async (
    req: AuthenticatedReqParams<{ id: string }>, 
    res: TypedResponse<ListRes>, next: NextFunction) => {
    try {
      const list = await List.findById(req.params.id);
      if (!list) {
        throw new ErrorWithStatus('List not found', 404);
      }
      const deletedList: List = await list.delete();
      res.json({
        message: 'List deleted successfully',
        list: deletedList
      });
    } catch (e) {
      next(e);
    }
  });

