import { User } from '../models/User.js';
import { Rows } from './global.js';

export type UserRows = Rows<UserFromDB>;

export type UserFromDB = {
  id: string;
  email: string;
  password_hash: string;
  username: string;
}

export type UserSignUpData = {
  email: string;
  password: string;
  username: string;
}

export type HashedSignUpData = {
  email: string;
  passwordHash: string;
  username: string;
}

export type UserSignInData = {
  email: string;
  password: string;
};

export type SignInResponse = {
  token: string;
  user: User;
}
