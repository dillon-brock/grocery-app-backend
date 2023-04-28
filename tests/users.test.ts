/* @jest-environment node */
import { setupDb } from './utils.js';
import request from 'supertest';
import app from '../lib/app.js';
import { UserService } from '../lib/services/UserService.js';

const testUser = {
  email: 'test@user.com',
  password: '123456',
  username: 'test_user'
}

describe('user route tests', () => {
  beforeEach(setupDb);

  it('signs up a new user on POST /users', async () => {
    const res = await request(app).post('/users').send(testUser);
    expect(res.status).toBe(200);
    expect(res.body.message).toEqual('Signed up and logged in successfully');
    expect(res.body.token).toEqual(expect.any(String));
  });

  it('signs in existing user on POST /users/sessions', async () => {
    await UserService.create({ ...testUser });
    const res = await request(app).post('/users/sessions')
      .send({ email: testUser.email, password: testUser.password });
    expect(res.status).toBe(200);
    expect(res.body.message).toEqual('Signed in successfully');
    expect(res.body.token).toEqual(expect.any(String));
  })

});