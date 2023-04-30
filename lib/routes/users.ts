import { Router, type Request, type Response, type NextFunction } from 'express';
import { UserService } from '../services/UserService.js';
import { AuthenticatedRequest } from '../types/global.js';
import authenticate from '../middleware/authenticate.js';
import { User } from '../models/User.js';

export default Router()
  .post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, username } = req.body;
      await UserService.create({ email, password, username });
      const token = await UserService.signIn({ email, password });
      res.status(200)
        .json({ 
          message: 'Signed up and logged in successfully', 
          token 
        });
    } catch (e) {
      next(e);
    }
  })
  .post('/sessions', async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    try {
      const token = await UserService.signIn({ email, password });
      res.status(200)
        .json({ message: 'Signed in successfully', token });
    } catch (e) {
      next(e);
    }
  })
  .get('/me', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        res.json({ user: null, message: 'No current user' });
      }
      else {
        const user = await User.findByEmail(req.user.email);
        res.json({ user, message: 'Current user found' });
      }
    } catch (e) {
      next(e);
    }
  });

