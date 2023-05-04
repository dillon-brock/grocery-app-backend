import { Router } from 'express';
import { AuthenticatedReqBody, AuthenticatedReqQuery } from '../types/extendedExpress.js';
import { NewListShareData } from '../types/userList.js';
import { NextFunction, Response } from 'express-serve-static-core';
import { ListShare } from '../models/ListShare.js';
import authenticate from '../middleware/authenticate.js';
import { ErrorWithStatus } from '../types/error.js';
import { User } from '../models/User.js';
import authorizeListShare from '../middleware/authorization/list-share.js';
import authorizeGetSharedLists from '../middleware/authorization/get-shared-lists.js';

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
  .get('/users', authenticate, async (req: AuthenticatedReqQuery<{ listId: string }>, res: Response, next: NextFunction) => {
    try {
      const users = await ListShare.findUsersByListId(req.query.listId);
      res.json({
        message: 'Shared users found successfully',
        users
      });
    } catch (e) {
      next(e);
    }
  });
