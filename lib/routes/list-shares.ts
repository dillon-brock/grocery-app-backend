import { Router } from 'express';
import { AuthenticatedReqBody } from '../types/extendedExpress.js';
import { NewListShareData } from '../types/userList.js';
import { NextFunction, Response } from 'express-serve-static-core';
import { ListShare } from '../models/ListShare.js';
import authenticate from '../middleware/authenticate.js';
import { List } from '../models/List.js';
import { ErrorWithStatus } from '../types/error.js';

export default Router()
  .post('/', authenticate, async (req: AuthenticatedReqBody<NewListShareData>, res: Response, next: NextFunction) => {
    try {
      const list = await List.findById(req.body.listId);
      if (!list) throw new ErrorWithStatus('List not found', 404);
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
