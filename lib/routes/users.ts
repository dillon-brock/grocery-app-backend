import { Router, type Response, type NextFunction } from 'express';
import { UserService } from '../services/UserService.js';
import authenticate from '../middleware/authenticate.js';
import { User } from '../models/User.js';
import { AuthenticatedRequest, RequestWithBody } from '../types/extendedExpressTypes.js';
import { UserSignInData, UserSignUpData } from '../types/userTypes.js';

export default Router()
  .post('/', async (req: RequestWithBody<UserSignUpData>, res: Response, next: NextFunction) => {
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
  .post('/sessions', async (req: RequestWithBody<UserSignInData>, res: Response, next: NextFunction) => {
    try {
      const token = await UserService.signIn({ ...req.body });
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

