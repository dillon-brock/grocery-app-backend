import pool from "../../sql/pool";
import { InsertionError } from "../types/errorTypes";
import { HashedSignUpData, UserFromDatabase } from "../types/userTypes";

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

  static async insert({ email, passwordHash, username}: HashedSignUpData) {

    const { rows } = await pool.query(
      `INSERT INTO users (email, password_hash, username)
      VALUES ($1, $2, $3)
      RETURNING *`,
      [email, passwordHash, username]
    );

    if (!rows[0]) throw new InsertionError('users');

    return new User(rows[0]);
  }

  static async findByEmail(email: string) {

    const { rows } = await pool.query(
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
}
