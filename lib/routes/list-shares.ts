import { Router } from 'express';
import { AuthenticatedReqBody, AuthenticatedReqParams, AuthenticatedReqQuery, TypedResponse } from '../types/extendedExpress.js';
import { ListShareRes, NewListShareData, SharedListsRes, SharedUsersRes } from '../types/listShare.js';
import { NextFunction } from 'express-serve-static-core';
import { ListShare } from '../models/ListShare.js';
import authenticate from '../middleware/authenticate.js';
import { ErrorWithStatus } from '../types/error.js';
import { User } from '../models/User.js';
import authorizeListShare from '../middleware/authorization/list-shares/list-share.js';
import authorizeGetSharedUsers from '../middleware/authorization/list-shares/get-shared-users.js';
import authorizeDeleteListShare from '../middleware/authorization/list-shares/delete-list-share.js';
import validateNewListShare from '../middleware/validation/list-shares/create.js';

export default Router()
  .post('/', [authenticate, validateNewListShare, authorizeListShare], async (
    req: AuthenticatedReqBody<NewListShareData>, 
    res: TypedResponse<ListShareRes>, next: NextFunction) => {
    try {
      const otherUser = await User.findById(req.body.userId);
      if (!otherUser) throw new ErrorWithStatus('User not found', 404);
      const shareData = await ListShare.create(req.body);
      res.json({ 
        message: 'List shared successfully', 
        shareData
      });
    } 
    catch (e) {
      next(e);
    }
  })
  .get('/lists', [authenticate], async (
    req: AuthenticatedReqQuery<{ userId: string }>, 
    res: TypedResponse<SharedListsRes>, next: NextFunction) => {
    try {
      const sharedLists = await ListShare.findListsByUserId(req.user.id);
      res.json({
        message: 'Shared lists found',
        sharedLists
      });
    } catch (e) {
      next(e);
    }
  })
  .get('/users', [authenticate, authorizeGetSharedUsers], async (
    req: AuthenticatedReqQuery<{ listId: string }>, 
    res: TypedResponse<SharedUsersRes>, next: NextFunction) => {
    try {
      const users = await ListShare.findUsersByListId(req.query.listId);
      res.json({
        message: 'Shared users found successfully',
        users
      });
    } catch (e) {
      next(e);
    }
  })
  .delete('/:id', [authenticate, authorizeDeleteListShare], async (
    req: AuthenticatedReqParams<{id: string}>, 
    res: TypedResponse<ListShareRes>, next: NextFunction) => {
    try {
      const deletedShare = await ListShare.deleteById(req.params.id);
      res.json({
        message: 'Stopped sharing list successfully',
        shareData: deletedShare
      });
    } catch (e) {
      next(e);
    }
  });
