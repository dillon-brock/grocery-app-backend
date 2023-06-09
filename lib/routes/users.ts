import { Router } from 'express';
import { UserService } from '../services/UserService.js';
import authenticate from '../middleware/authenticate.js';
import { PublicUser, User } from '../models/User.js';
import { AuthenticatedReqQuery, AuthenticatedRequest, RequestWithBody, RequestWithQuery, TypedResponse } from '../types/extendedExpress.js';
import { PublicUserRes, PublicUsersRes, TokenRes, UserRes, UserSignInData, UserSignUpData } from '../types/user.js';
import { NextFunction } from 'express-serve-static-core';
import validateCheckForExistingUsername from '../middleware/validation/users/find.js';

export default Router()
  .post('/', async (req: RequestWithBody<UserSignUpData>, 
    res: TypedResponse<TokenRes>, next: NextFunction) => {
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
  .post('/sessions', async (req: RequestWithBody<UserSignInData>, 
    res: TypedResponse<TokenRes>, next: NextFunction) => {
    try {
      const token = await UserService.signIn({ ...req.body });
      res.status(200)
        .json({ message: 'Signed in successfully', token });
    } catch (e) {
      next(e);
    }
  })
  .get('/me', authenticate, async (req: AuthenticatedRequest, 
    res: TypedResponse<UserRes>, next: NextFunction) => {
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
  })
  .get('/find', validateCheckForExistingUsername, async (req: RequestWithQuery<{ username: string }>,
    res: TypedResponse<PublicUserRes>, next: NextFunction) => {
    try {
      const user = await PublicUser.checkForExisting(req.query.username);
      res.json({
        message: user ? 'User found' : 'No user found',
        user
      });
    } catch (e) {
      next(e);
    }
  })
  .get('/', authenticate, async (req: AuthenticatedReqQuery<{ username: string }>,
    res: TypedResponse<PublicUsersRes>, next: NextFunction) => {
    try {
      const users = await PublicUser.findByUsername(req.query.username);
      res.json({
        message: users.length > 0 ? 'Users found' : 'No users found',
        users
      });
    }
    catch (e) {
      next(e);
    }
  });

