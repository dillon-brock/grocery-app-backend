import { Router } from 'express';
import authenticate from '../middleware/authenticate.js';
import { List, ListWithItems } from '../models/List.js';
import { AuthenticatedReqBody, AuthenticatedRequest, TypedAuthenticatedRequest, TypedResponse } from '../types/extendedExpress.js';
import findListAndAuthorize from '../middleware/authorization/find-list-and-authorize.js';
import { ListRes, MultipleListsRes, NewListData } from '../types/list.js';
import { NextFunction } from 'express-serve-static-core';
import { Category } from '../models/Category.js';

const defaultCategories: string[] = ['Fruit', 'Vegetables', 'Dry Goods', 
  'Canned Goods', 'Protein', 'Dairy', 'Beverages', 'Snacks'];

export default Router()
  .post('/', authenticate, async (
    req: AuthenticatedReqBody<NewListData>, 
    res: TypedResponse<ListRes>, next: NextFunction) => {
    try {
      const newList: List = await List.create({ ...req.body, ownerId: req.user.id });
      const listId = newList.id;
      Promise.all(defaultCategories.map(category => (
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
  .get('/:id', [authenticate, findListAndAuthorize], async (
    req: TypedAuthenticatedRequest<{ list: ListWithItems }, { id: string }>, 
    res: TypedResponse<ListRes>, next: NextFunction) => {
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
  .delete('/:id', [authenticate, findListAndAuthorize], async (
    req: TypedAuthenticatedRequest<{ list: List }, { id: string }>, 
    res: TypedResponse<ListRes>, next: NextFunction) => {
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

