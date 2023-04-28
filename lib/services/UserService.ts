import bcrypt from 'bcrypt';
import { UserSignUpData } from '../types/userTypes';
import { User } from '../models/User';

export class UserService {
  static async create({ email, username, password }: UserSignUpData): Promise<User> {
    if (email.length <= 6) {
      throw new Error('Invalid email');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    const passwordHash: string = await bcrypt.hash(
      password,
      Number(process.env.SALT_ROUNDS)
    );

    const user: User = await User.insert({
      email,
      passwordHash,
      username
    });

    return user;
  }
}
