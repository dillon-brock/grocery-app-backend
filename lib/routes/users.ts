import { Router, type Request, type Response, type NextFunction } from 'express';
import { UserService } from '../services/UserService';

export default Router()
  .post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, username } = req.body;
      const newUser = await UserService.create({ email, password, username });
      const token = await UserService.signIn({ email, password });
      res.status(200).json({ 
        message: 'Signed up and logged in successfully',
        user: newUser,
        token
      });
    } catch (e) {
      next(e);
    }
  });
