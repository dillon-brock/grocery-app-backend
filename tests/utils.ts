import { readFileSync } from 'node:fs';
import pool from '../sql/pool.js';
const sql = readFileSync('./sql/setup.sql', 'utf-8');

function setupDb() {
  return pool.query(sql);
}

function closeAll() {
  return pool.end();
}

afterAll(closeAll);

module.exports = {
  setupDb,
};
