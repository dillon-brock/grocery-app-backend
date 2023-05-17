import { PublicUser, User } from '../models/User.js';
import { Rows, SuccessResponse } from './global.js';

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

export interface TokenRes extends SuccessResponse {
  token: string;
}

export interface UserRes extends SuccessResponse {
  user: User | null;
}

export interface MultipleUserRes extends SuccessResponse {
  users: User[];
}



export type PublicUserFromDB = {
  id: string;
  username: string;
}

export type PublicUserRows = Rows<PublicUserFromDB>;

export interface PublicUsersRes extends SuccessResponse {
  users: PublicUser[];
}
