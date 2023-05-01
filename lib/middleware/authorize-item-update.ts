import { NextFunction, Response } from 'express-serve-static-core';
import { TypedAuthenticatedRequest } from '../types/extendedExpressTypes.js';
import { ListItem } from '../models/ListItem.js';
import { ErrorWithStatus } from '../types/errorTypes.js';
import { ListItemUpdateData } from '../types/listItemTypes.js';

export default async (req: TypedAuthenticatedRequest<ListItemUpdateData, {id: string}>, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const listItem = await ListItem.findById(req.params.id);
    if (!listItem) 
      throw new ErrorWithStatus('List item not found', 404);

    const itemOwnerId: string = await listItem.getOwnerId();
    if (itemOwnerId != userId) {
      throw new ErrorWithStatus('You are not authorized to access this item', 403);
    }

    next();
  } catch (e) {
    next(e);
  }
};
