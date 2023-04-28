import { Router, type Request, type Response, type NextFunction } from 'express';
import { UserService } from '../services/UserService';

export default Router()
  .post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, username } = req.body;
      const newUser = await UserService.create({ email, password, username });
      res.json(newUser);
    } catch (e) {
      next(e);
    }
  });
