import { UserFromDatabase } from "../types/userTypes";

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
}