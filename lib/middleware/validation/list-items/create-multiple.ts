import { NextFunction, Response } from 'express-serve-static-core';
import { AuthenticatedReqBody } from '../../../types/extendedExpress.js';
import { NewListItemBody } from '../../../types/listItem.js';
import { ErrorWithStatus } from '../../../types/error.js';

export default async (req: AuthenticatedReqBody<{ items: NewListItemBody[] }>, res: Response, next: NextFunction) => {

  type Found = {
    // eslint-disable-next-line no-unused-vars
    [Property in keyof NewListItemBody]: boolean;
  };

  try {
    for (const item of req.body.items) {
      const foundArgs: Found = {
        'item': false,
        'quantity': false,
        'categoryId': false
      };
  
      const argKeys = Object.keys(item) as Array<keyof NewListItemBody>;
  
      for (const key of argKeys) {
        if (foundArgs[key] == undefined) {
          throw new ErrorWithStatus(`Invalid payload - unexpected argument ${key}`, 400);
        }
        else if (key != 'quantity' && typeof item[key] != 'string') {
          throw new ErrorWithStatus(`Invalid payload - ${key} must be string`, 400);
        }
        else if (key == 'quantity' && typeof item[key] != 'string' && item[key] !== null) {
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
    }

    next();
  }
  catch(e) {
    next(e);
  }
};
