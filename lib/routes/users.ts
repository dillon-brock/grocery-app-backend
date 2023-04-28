import { Router, type Request, type Response, type NextFunction } from 'express';
import { UserService } from '../services/UserService.js';
import { AuthenticatedRequest } from '../../types.js';
import authenticate from '../middleware/authenticate.js';

const ONE_DAY_IN_MS = 1000 * 60 * 60 * 24;

export default Router()
  .post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, username } = req.body;
      await UserService.create({ email, password, username });
      const token = await UserService.signIn({ email, password });
      res.status(200)
        .cookie(process.env.COOKIE_NAME, token, {
          httpOnly: false,
          maxAge: ONE_DAY_IN_MS
        })
        .json({ message: 'Signed up and logged in successfully' });
    } catch (e) {
      next(e);
    }
  })
  .post('/sessions', async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    try {
      const token = await UserService.signIn({ email, password });
      res.status(200)
        .cookie(process.env.COOKIE_NAME, token, {
          httpOnly: false,
          maxAge: ONE_DAY_IN_MS
        })
        .json({ message: 'Signed in successfully' });
    } catch (e) {
      next(e);
    }
  })
  .get('/me', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    
  });

