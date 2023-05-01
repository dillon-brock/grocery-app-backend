import { List } from '../models/List.js';
import { ErrorWithStatus } from '../types/errorTypes.js';
import { AuthenticatedReqParams } from '../types/extendedExpressTypes.js';
import { Response, NextFunction } from 'express-serve-static-core';

export default async (req: AuthenticatedReqParams<{id: string}>, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    if (!userId || typeof userId != 'string') {
      throw new ErrorWithStatus('You must be signed in to continue', 401);
    }

    const list = await List.findById(req.params.id);
    if (!list) throw new ErrorWithStatus('List not found', 404);

    if (list.ownerId != userId) {
      throw new ErrorWithStatus('You are not authorized to access this list', 403);
    }

    next();
  } catch (e) {
    next(e);
  }
};
