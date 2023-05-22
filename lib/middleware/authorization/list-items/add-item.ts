import { NextFunction, Response } from 'express-serve-static-core';
import { AuthenticatedRequest } from '../../../types/extendedExpress.js';
import { ErrorWithStatus } from '../../../types/error.js';
import { List } from '../../../models/List.js';

export default async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const listId = req.query.listId;
    if (!listId) {
      throw new ErrorWithStatus('Incomplete query (list not specified)', 400);
    }
    const list = await List.findById(listId as string);
    if (!list) {
      throw new ErrorWithStatus('List not found', 404);
    }

    if (req.user.id != list.ownerId) {
      const userCanEdit: boolean = await list.checkIfUserCanEdit(req.user.id);
      if (!userCanEdit) {
        throw new ErrorWithStatus('You are not authorized to edit this list', 403);
      }
    }
    next();
  } catch (e) {
    next(e);
  }
};
