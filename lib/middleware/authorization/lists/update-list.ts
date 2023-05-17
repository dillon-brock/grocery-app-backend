import { NextFunction, Response } from 'express-serve-static-core';
import { AuthenticatedReqParams } from '../../../types/extendedExpress.js';
import { List } from '../../../models/List.js';
import { ErrorWithStatus } from '../../../types/error.js';

export default async(req: AuthenticatedReqParams<{id: string}>, res: Response, next: NextFunction) => {

  try {
    const list = await List.findById(req.params.id);
    if (!list) {
      throw new ErrorWithStatus('List not found', 404);
    }
  
    if (req.user.id != list.id) {
      const userCanEdit = await list.checkIfUserCanEdit(req.user.id);
      if (!userCanEdit) {
        throw new ErrorWithStatus('You are not authorized to edit this list', 403);
      }
    }

    next();
  } catch (e) {
    next(e);
  }
};
