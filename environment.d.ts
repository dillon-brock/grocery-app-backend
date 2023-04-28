/* eslint-disable no-unused-vars */
export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PGDATABASE: string;
      PGUSER: string;
      PGPASSWORD: string;
      PGHOST: string;
      PGPORT: string;
      JWT_SECRET: string;
      SALT_ROUNDS: string;
      COOKIE_NAME: string;
    }
  }
}
