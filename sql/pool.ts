import pg from 'pg';

import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: !!process.env.PGSSLMODE && { rejectUnauthorized: false },
});

// eslint-disable-next-line no-console
pool.on('connect', () => console.log('🐘 Postgres connected'));

export default pool;
