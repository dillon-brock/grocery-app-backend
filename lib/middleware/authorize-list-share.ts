import { NextFunction, Response } from 'express-serve-static-core';
import { AuthenticatedReqBody } from '../types/extendedExpress.js';
import { NewListShareData } from '../types/userList.js';
import { List } from '../models/List.js';
import { ErrorWithStatus } from '../types/error.js';

export default async (req: AuthenticatedReqBody<NewListShareData>, res: Response, next: NextFunction) => {
  try {
    const list = await List.findById(req.body.listId);
    if (!list) throw new ErrorWithStatus('List not found', 404);
    
    if (list.ownerId != req.user.id) {
      throw new ErrorWithStatus('You are not authorized to share this list', 403);
    }

    next();
  } catch (e) {
    next(e);
  }
};
