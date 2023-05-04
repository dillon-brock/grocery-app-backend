import { Router } from 'express';
import { AuthenticatedReqBody, AuthenticatedReqParams, AuthenticatedReqQuery } from '../types/extendedExpress.js';
import { NewListShareData } from '../types/userList.js';
import { NextFunction, Response } from 'express-serve-static-core';
import { ListShare } from '../models/ListShare.js';
import authenticate from '../middleware/authenticate.js';
import { ErrorWithStatus } from '../types/error.js';
import { User } from '../models/User.js';
import authorizeListShare from '../middleware/authorization/list-share.js';
import authorizeGetSharedLists from '../middleware/authorization/get-shared-lists.js';
import authorizeGetSharedUsers from '../middleware/authorization/get-shared-users.js';

export default Router()
  .post('/', [authenticate, authorizeListShare], async (req: AuthenticatedReqBody<NewListShareData>, res: Response, next: NextFunction) => {
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
  .get('/lists', [authenticate, authorizeGetSharedLists], async (req: AuthenticatedReqQuery<{ userId: string }>, res: Response, next: NextFunction) => {
    try {
      const sharedLists = await ListShare.findListsByUserId(req.query.userId);
      res.json({
        message: 'Shared lists found',
        sharedLists
      });
    } catch (e) {
      next(e);
    }
  })
  .get('/users', [authenticate, authorizeGetSharedUsers], async (req: AuthenticatedReqQuery<{ listId: string }>, res: Response, next: NextFunction) => {
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
  .delete('/:id', async (req: AuthenticatedReqParams<{id: string}>, res: Response, next: NextFunction) => {
    try {
      const deletedShare = await ListShare.deleteById(req.params.id);
      res.json({
        message: 'Stopped sharing list successfully',
        deletedShareData: deletedShare
      });
    } catch (e) {
      next(e);
    }
  });
