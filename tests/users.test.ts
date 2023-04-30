/* @jest-environment node */
import { setupDb } from './utils.js';
import request from 'supertest';
import app from '../lib/app.js';
import { UserService } from '../lib/services/UserService.js';

const testUser = {
  email: 'test@user.com',
  password: '123456',
  username: 'test_user'
};

describe('user route tests', () => {
  beforeEach(setupDb);

  it('signs up a new user on POST /users', async () => {
    const res = await request(app).post('/users').send(testUser);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Signed up and logged in successfully',
      token: expect.any(String)
    });
  });

  it('signs in existing user on POST /users/sessions', async () => {
    await UserService.create({ ...testUser });
    const res = await request(app).post('/users/sessions')
      .send({ email: testUser.email, password: testUser.password });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Signed in successfully',
      token: expect.any(String)
    });
  });

  it('gets current user at GET /users/me', async () => {
    const agent = request.agent(app);
    const signUpRes = await agent.post('/users').send(testUser);
    const { token } = signUpRes.body;
    const res = await agent
      .get('/users/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toEqual('Current user found');
    expect(res.body.user).toEqual({
      id: expect.any(String),
      email: testUser.email,
      username: testUser.username
    });
  });
});
