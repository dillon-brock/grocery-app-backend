import { NextFunction, Response } from 'express-serve-static-core';
import { AuthenticatedReqParams } from '../../../types/extendedExpress.js';
import { ListShare } from '../../../models/ListShare.js';
import { ErrorWithStatus } from '../../../types/error.js';
import { List } from '../../../models/List.js';

export default async(req: AuthenticatedReqParams<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const listShareData: ListShare | null = await ListShare.findById(req.params.id);
    if (!listShareData) {
      throw new ErrorWithStatus('List share data not found', 404);
    }
  
    const list = await List.findById(listShareData.listId);
    if (!list) {
      throw new ErrorWithStatus('List not found', 404);
    }
    if (req.user.id != list.ownerId) {
      throw new ErrorWithStatus('You are not authorized to alter the sharing settings of this list', 403);
    }
  
    next();
  } catch (e) {
    next(e);
  }
};
