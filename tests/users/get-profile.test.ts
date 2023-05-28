import { setupDb, testUser } from '../utils.js';
import request from 'supertest';
import app from '../../lib/app.js';

describe('GET /users/me tests', () => {
  beforeEach(setupDb);

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

  it('returns null when no user is signed in', async () => {
    const res = await request(app).get('/users/me');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'No current user',
      user: null
    });
  });
});
