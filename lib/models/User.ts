import pool from '../../sql/pool.js';
import { InsertionError } from '../types/error.js';
import { HashedSignUpData, UserFromDatabase, UserRows } from '../types/user.js';

export class User {
  id: string;
  email: string;
  #passwordHash: string;
  username: string;

  constructor(row: UserFromDatabase) {
    this.id = row.id;
    this.email = row.email;
    this.#passwordHash = row.password_hash;
    this.username = row.username;
  }

  static async insert({ email, passwordHash, username }: HashedSignUpData) {

    const { rows }: UserRows = await pool.query(
      `INSERT INTO users (email, password_hash, username)
      VALUES ($1, $2, $3)
      RETURNING *`,
      [email, passwordHash, username]
    );

    if (!rows[0]) throw new InsertionError('users');

    return new User(rows[0]);
  }

  static async findByEmail(email: string) {

    const { rows }: UserRows = await pool.query(
      `SELECT * FROM users
      WHERE email = $1`,
      [email]
    );

    if (!rows[0]) return null;
    return new User(rows[0]);
  }

  get passwordHash(): string {
    return this.#passwordHash;
  }

  static async findByUsername(username: string): Promise<User | null> {

    const { rows }: UserRows = await pool.query(
      `SELECT * FROM users
      WHERE username = $1`,
      [username]
    );

    if (!rows[0]) return null;
    return new User(rows[0]);
  }

  static async findById(id: string): Promise<User | null> {

    const { rows }: UserRows = await pool.query(
      `SELECT * FROM users
      WHERE id = $1`,
      [id]
    );

    if (!rows[0]) return null;
    return new User(rows[0]);
  }
}
