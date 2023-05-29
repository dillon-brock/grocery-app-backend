import pool from '../../sql/pool.js';
import { InsertionError } from '../types/error.js';
import { HashedSignUpData, PublicUserFromDB, PublicUserRows, UserFromDB, UserRows } from '../types/user.js';

export class PublicUser {
  id: string;
  username: string;

  constructor(row: PublicUserFromDB) {
    this.id = row.id;
    this.username = row.username;
  }

  static async findByUsername(username: string): Promise<PublicUser[]> {
    username = `${username}%`;

    const { rows }: PublicUserRows = await pool.query(
      `SELECT id, username FROM users
      WHERE users.username ILIKE $1`,
      [username]
    );

    return rows.map(row => new PublicUser(row));
  }

  static async checkForExisting(username: string): Promise<PublicUser | null> {
    const { rows }: PublicUserRows = await pool.query(
      `SELECT id, username FROM users
      WHERE users.username = $1`,
      [username]
    );

    if (!rows[0]) return null;
    return new PublicUser(rows[0]);
  }
}

export class User {
  id: string;
  email: string;
  #passwordHash: string;
  username: string;

  constructor(row: UserFromDB) {
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
