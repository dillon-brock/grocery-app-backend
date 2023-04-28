export type UserFromDatabase = {
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
