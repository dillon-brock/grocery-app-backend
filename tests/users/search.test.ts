import { setupDb, testUser } from '../utils.js';
import request from 'supertest';
import app from '../../lib/app.js';

describe('GET /users/find', () => {
  beforeEach(setupDb);

  it('gets an existing user at GET /users/find', async () => {
    const agent = request.agent(app);

    await agent.post('/users').send(testUser);
    const res = await agent.get(`/users/find?username=${testUser.username}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'User found',
      user: {
        id: expect.any(String),
        username: testUser.username
      }
    });
  });

  it('returns null if no user exists', async () => {
    const res = await request(app).get(`/users/find?username=${testUser.username}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'No user found',
      user: null
    });
  });
});
