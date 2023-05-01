import { NextFunction, Response } from 'express-serve-static-core';
import { AuthenticatedReqBody } from '../types/extendedExpressTypes.js';
import { NewListItemData } from '../types/listItemTypes.js';
import { List } from '../models/List.js';
import { ErrorWithStatus } from '../types/errorTypes.js';

export default async (req: AuthenticatedReqBody<NewListItemData>, res: Response, next: NextFunction) => {
  try {
    const { listId } = req.body;

    const list = await List.findById(listId);
    if (!list) throw new ErrorWithStatus('List not found', 404);
    if (req.user.id != list.ownerId) {
      throw new ErrorWithStatus('You are not authorized to add items to this list', 403);
    }
    next();
  } catch (e) {
    next(e);
  } 

};
