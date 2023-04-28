import { Router, type Request, type Response, type NextFunction } from 'express';
import { UserService } from '../services/UserService.js';
import { AuthenticatedRequest } from '../../types.js';
import checkForUser from '../middleware/checkForUser.js';
import { User } from '../models/User.js';

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
  .get('/me', checkForUser, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        res.json({ user: null })
      }
      else {
        const user = await User.findByEmail(req.user.email);
        res.json(user);
      }
    } catch (e) {
      next(e);
    }
  })
  .delete('/sessions', async (req: Request, res: Response) => {
    res
      .clearCookie(process.env.COOKIE_NAME, {
        httpOnly: false,
        maxAge: ONE_DAY_IN_MS,
      })
      .status(200)
      .json({ message: 'Signed out successfully' });
  })

