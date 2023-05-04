import { Router } from 'express';
import { AuthenticatedReqBody } from '../types/extendedExpress.js';
import { NewUserListData } from '../types/userList.js';
import { NextFunction, Response } from 'express-serve-static-core';
import { UserList } from '../models/UserList.js';

export default Router()
  .post('/', async (req: AuthenticatedReqBody<NewUserListData>, res: Response, next: NextFunction) => {
    try {
      const shareData = await UserList.create(req.body);
      res.json({ 
        message: 'List shared successfully', 
        shareData
      });
    } 
    catch (e) {
      next(e);
    }
  });
