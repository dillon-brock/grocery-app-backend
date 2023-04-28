import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserSignInData, UserSignUpData } from '../types/userTypes';
import { User } from '../models/User';
import { ErrorWithStatus } from '../types/errorTypes';

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

  static async signIn({ email, password }: UserSignInData): Promise<string> {
    
    const user = await User.findByEmail(email);
    if (!user) throw new ErrorWithStatus('Invalid email', 401);
    if (!bcrypt.compareSync(password, user.passwordHash))
      throw new ErrorWithStatus('Invalid password', 401);

    const token = jwt.sign({ ...user }, process.env.JWT_SECRET, {
      expiresIn: '1 day',
    });

    return token;

  }
}
