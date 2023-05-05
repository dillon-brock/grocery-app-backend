import { NextFunction, Response } from 'express-serve-static-core';
import { AuthenticatedReqBody } from '../../types/extendedExpress.js';
import { NewListItemData } from '../../types/listItem.js';
import { List } from '../../models/List.js';
import { ErrorWithStatus } from '../../types/error.js';

export default async (req: AuthenticatedReqBody<NewListItemData>, res: Response, next: NextFunction) => {
  try {
    const { listId } = req.body;

    const list = await List.findById(listId);
    if (!list) throw new ErrorWithStatus('List not found', 404);

    const userHasEditAccess: boolean = await list.checkIfSharedWithUser(req.user.id);
    if (!userHasEditAccess && req.user.id != list.ownerId) {
      throw new ErrorWithStatus('You are not authorized to edit this list', 403);
    }
    next();
  } catch (e) {
    next(e);
  } 

};
