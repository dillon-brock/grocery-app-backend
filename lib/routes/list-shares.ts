import { Router } from 'express';
import { AuthenticatedReqBody } from '../types/extendedExpress.js';
import { NewListShareData } from '../types/userList.js';
import { NextFunction, Response } from 'express-serve-static-core';
import { ListShare } from '../models/ListShare.js';
import authenticate from '../middleware/authenticate.js';
import { ErrorWithStatus } from '../types/error.js';
import { User } from '../models/User.js';
import authorizeListShare from '../middleware/authorization/list-share.js';

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
  });
