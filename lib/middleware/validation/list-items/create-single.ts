import { NextFunction, Response } from 'express-serve-static-core';
import { AuthenticatedReqBody } from '../../../types/extendedExpress.js';
import { NewListItemBody } from '../../../types/listItem.js';
import { ErrorWithStatus } from '../../../types/error.js';

export default async (req: AuthenticatedReqBody<NewListItemBody>, res: Response, next: NextFunction) => {
  try {
    const listId = req.query.listId;
    if (!listId) {
      throw new ErrorWithStatus('Invalid query - listId required', 400);
    }

    type Found = {
      // eslint-disable-next-line no-unused-vars
      [Property in keyof NewListItemBody]: boolean;
    };

    const foundArgs: Found = {
      'item': false,
      'quantity': false,
      'categoryId': false
    };

    const argKeys = Object.keys(req.body) as Array<keyof NewListItemBody>;

    for (const key of argKeys) {
      if (foundArgs[key] == undefined) {
        throw new ErrorWithStatus(`Invalid payload - unexpected argument ${key}`, 400);
      }
      else if (key != 'quantity' && typeof req.body[key] != 'string') {
        throw new ErrorWithStatus(`Invalid payload - ${key} must be string`, 400);
      }
      else if (key == 'quantity' && typeof req.body[key] != 'string' && req.body[key] != null) {
        throw new ErrorWithStatus('Invalid payload - quantity must be string or null', 400);
      }
      else {
        foundArgs[key] = true;
      }
    }

    for (const [k, v] of Object.entries(foundArgs)) {
      if (!v) {
        throw new ErrorWithStatus(`Invalid payload - ${k} is required`, 400);
      }
    }

    next();
  }
  catch(e) {
    next(e);
  }
};
