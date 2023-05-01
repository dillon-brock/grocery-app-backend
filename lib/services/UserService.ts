import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserSignInData, UserSignUpData } from '../types/userTypes.js';
import { User } from '../models/User.js';
import { ErrorWithStatus } from '../types/errorTypes.js';

export class UserService {
  static async create({ email, username, password }: UserSignUpData): Promise<User> {
    if (email.length <= 6) {
      throw new ErrorWithStatus('Invalid email', 400);
    }
    const userWithEmail: User | null = await User.findByEmail(email);
    if (userWithEmail) throw new ErrorWithStatus('Email already exists', 409);

    if (password.length < 6) {
      throw new ErrorWithStatus('Password must be at least 6 characters long', 400);
    }

    const userWithUsername: User | null = await User.findByUsername(username);
    if (userWithUsername) throw new ErrorWithStatus('Username already exists', 409);

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
    if (!user) throw new ErrorWithStatus('Invalid email', 400);
    if (!bcrypt.compareSync(password, user.passwordHash))
      throw new ErrorWithStatus('Invalid password', 400);

    const token = jwt.sign({ ...user }, process.env.JWT_SECRET, {
      expiresIn: '1 day',
    });

    return token;

  }
}
