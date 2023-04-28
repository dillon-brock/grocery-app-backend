/* @jest-environment node */
import { setupDb } from './utils.js';
import request from 'supertest';
import app from '../lib/app.js';

const testUser = {
  email: 'test@user.com',
  password: '123456'
}

describe('user route tests', () => {
  beforeEach(setupDb);

  it('signs up a new user on POST /users', async () => {
    const res = await request(app).post('/users').send(testUser);
    expect(res.status).toBe(200);
    expect(res.body.message).toEqual('Signed up and logged in successfully');
    expect(res.body.token).toEqual(expect.any(String));
  })

});