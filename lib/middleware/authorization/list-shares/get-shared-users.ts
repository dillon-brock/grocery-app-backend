import { NextFunction, Response } from 'express-serve-static-core';
import { AuthenticatedRequest } from '../../../types/extendedExpress.js';
import { List } from '../../../models/List.js';
import { ErrorWithStatus } from '../../../types/error.js';

export default async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const listId = req.query.listId as string;
    const list = await List.findById(listId);
    if (!list) {
      throw new ErrorWithStatus('List not found', 404);
    }
  
    if (list.ownerId != req.user.id) {
      throw new ErrorWithStatus('You are not authorized to view this information', 403);
    }
  
    next();
  } catch (e) {
    next(e);
  }
};
