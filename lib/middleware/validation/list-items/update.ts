import { NextFunction, Response } from 'express-serve-static-core';
import { AuthenticatedReqBody } from '../../../types/extendedExpress.js';
import { ListItemUpdateData } from '../../../types/listItem.js';
import { ErrorWithStatus } from '../../../types/error.js';

export default async (req: AuthenticatedReqBody<ListItemUpdateData>, res: Response, next: NextFunction) => {
  type Entries = Array<[keyof ListItemUpdateData, string | null]>;

  try {
    const possibleArgs: Set<keyof ListItemUpdateData> = new Set(['bought', 'category_id', 'item', 'quantity']);

    for (const [k, v] of Object.entries(req.body) as Entries) {
      if (!possibleArgs.has(k)) {
        throw new ErrorWithStatus(`Invalid payload - unexpected argument ${k}`, 400);
      }
      if ((k == 'item' || k == 'category_id') && typeof v != 'string') {
        throw new ErrorWithStatus(`Invalid payload - ${k} must be string or omitted`, 400);
      }
      else if (k == 'quantity' && typeof v != 'string' && v != null) {
        throw new ErrorWithStatus('Invalid payload - quantity must be string or null or omitted', 400);
      }
      else if (k == 'bought' && typeof v != 'boolean') {
        throw new ErrorWithStatus('Invalid payload - bought must be boolean or omitted', 400);
      }
    }
    
    next();
  } catch (e) {
    next(e);
  }
};
