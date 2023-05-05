import { NextFunction, Response } from 'express-serve-static-core';
import { AuthenticatedReqParams } from '../../types/extendedExpress.js';
import { Category } from '../../models/Category.js';
import { List } from '../../models/List.js';
import { ErrorWithStatus } from '../../types/error.js';

export default async (req: AuthenticatedReqParams<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      throw new ErrorWithStatus('Category not found', 404);
    }

    const list = await List.findById(category.listId);
    if (!list) {
      throw new ErrorWithStatus('List not found', 404);
    }
    const userHasEditAccess: boolean = await list.checkIfSharedWithUser(req.user.id);

    if (!userHasEditAccess && list.ownerId != req.user.id) {
      throw new ErrorWithStatus('You are not authorized to access this category', 403);
    }
    next();
  } catch (e) {
    next(e);
  }
};
