import { List } from '../../../models/List.js';
import { ErrorWithStatus } from '../../../types/error.js';
import { AuthenticatedReqParams } from '../../../types/extendedExpress.js';
import { Response, NextFunction } from 'express-serve-static-core';

export default async (req: AuthenticatedReqParams<{id: string}>, res: Response, next: NextFunction) => {
  try {

    const list = await List.findById(req.params.id);
    if (!list) {
      throw new ErrorWithStatus('List not found', 404);
    }
    if (req.method == 'GET') {
      const userCanView = await list.checkIfUserCanView(req.user.id);
      if (!userCanView && list.ownerId != req.user.id) {
        throw new ErrorWithStatus('You are not authorized to access this list', 403);
      }
    } else {
      if (list.ownerId != req.user.id) {
        throw new ErrorWithStatus('You are not authorized to access this list', 403);
      }
    }
    next();
  } catch (e) {
    next(e);
  }
};
