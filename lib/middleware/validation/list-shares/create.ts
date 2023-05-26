import { NextFunction, Response } from 'express-serve-static-core';
import { AuthenticatedReqBody } from '../../../types/extendedExpress.js';
import { NewListShareData } from '../../../types/listShare.js';
import { ErrorWithStatus } from '../../../types/error.js';
import { List } from '../../../models/List.js';
import { User } from '../../../models/User.js';

export default async (req: AuthenticatedReqBody<NewListShareData>, res: Response, next: NextFunction) => {
  try {
    const { listId, userId, editable } = req.body;

    if (listId == undefined) {
      throw new ErrorWithStatus('Invalid payload - listId is required', 400);
    }
    if (typeof listId != 'string') {
      throw new ErrorWithStatus('Invalid payload - listId must be string', 400);
    }
    const list = await List.findById(listId);
    if (!list) {
      throw new ErrorWithStatus('List not found', 404);
    }

    if (userId == undefined) {
      throw new ErrorWithStatus('Invalid payload - userId is required', 400);
    }
    if (typeof userId != 'string') {
      throw new ErrorWithStatus('Invalid payload - userId must be string', 400);
    }
    const user = await User.findById(userId);
    if (!user) {
      throw new ErrorWithStatus('User not found', 404);
    }

    if (editable == undefined) {
      throw new ErrorWithStatus('Invalid payload - editable is required', 400);
    }
    if (typeof editable != 'boolean') {
      throw new ErrorWithStatus('Invalid payload - editable must be boolean', 400);
    }
    next();
  } catch (e) {
    next(e);
  }
};
