import { setupDb, testUser, testUser2 } from '../utils.js';
import request from 'supertest';
import app from '../../lib/app.js';

describe('POST /users (sign up) tests', () => {
  beforeEach(setupDb);

  it('signs up a new user on POST /users', async () => {
    const res = await request(app).post('/users').send(testUser);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Signed up and logged in successfully',
      token: expect.any(String)
    });
  });

  it('gives a 409 error if user with username already exists', async () => {
    const agent = request.agent(app);
    await agent.post('/users').send(testUser);
    const res = await agent
      .post('/users')
      .send({ ...testUser2, username: testUser.username });
    
    expect(res.status).toBe(409);
    expect(res.body.message).toEqual('Username already exists');
  });

  it('gives a 409 error if user with email already exists', async () => {
    const agent = request.agent(app);
    await agent.post('/users').send(testUser);
    const res = await agent
      .post('/users')
      .send({ ...testUser2, email: testUser.email });

    expect(res.status).toBe(409);
    expect(res.body.message).toEqual('Email already exists');
  });

  it('gives a 400 error if password is too short', async () => {
    const res = await request(app)
      .post('/users')
      .send({ ...testUser, password: 'bad' });

    expect(res.status).toBe(400);
    expect(res.body.message).toEqual('Password must be at least 6 characters long');
  });
});
