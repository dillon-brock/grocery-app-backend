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
  });

  it('signs in existing user on POST /users/sessions', async () => {
    await UserService.create({ ...testUser });
    const res = await request(app).post('/users/sessions')
      .send({ email: testUser.email, password: testUser.password });
    expect(res.status).toBe(200);
    expect(res.body.message).toEqual('Signed in successfully');
  })

  it('gets current user at GET /users/me', async () => {
    const agent = request.agent(app);
    await agent.post('/users').send(testUser);
    const res = await agent.get('/users/me');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      id: expect.any(String),
      email: testUser.email,
      username: testUser.username
    })
  })

  it('logs out user at DELETE /users/sessions', async () => {
    const agent = request.agent(app);
    await agent.post('/users').send(testUser);
    const res = await agent.delete('/users/sessions');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Signed out successfully');
    const getUserRes = await agent.get('/users/me');
    expect(getUserRes.status).toBe(200);
    expect(getUserRes.body).toEqual({ user: null });
  })

});