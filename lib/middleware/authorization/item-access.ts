import { NextFunction, Response } from 'express-serve-static-core';
import { AuthenticatedReqParams } from '../../types/extendedExpress.js';
import { ListItem } from '../../models/ListItem.js';
import { ErrorWithStatus } from '../../types/error.js';
import { List } from '../../models/List.js';

export default async (req: AuthenticatedReqParams<{id: string}>, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const listItem = await ListItem.findById(req.params.id);
    if (!listItem) 
      throw new ErrorWithStatus('List item not found', 404);

    const itemOwnerId: string = await listItem.getOwnerId();
    const userIsOwner = itemOwnerId == userId;

    const parentList = await List.findById(listItem.listId);
    const userHasEditAccess = await parentList?.checkIfUserCanEdit(userId);

    if (!userIsOwner && !userHasEditAccess) {
      throw new ErrorWithStatus('You are not authorized to access this item', 403);
    }

    next();
  } catch (e) {
    next(e);
  }
};
