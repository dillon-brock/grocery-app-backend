import { setupDb } from './utils';
import request from 'supertest';
import app from '../lib/app.js';

const testUser = {
  email: 'test@user.com',
  password: '123456',
  username: 'test_user'
};

describe('list route tests', () => {
  beforeEach(setupDb);

  it('creates a new list on POST /lists', async () => {
    const agent = request.agent(app);

    // sign up user
    const signUpRes = await agent.post('/users').send(testUser);
    const { token } = signUpRes.body;
    // get user info to get id
    const getUserRes = await agent.get('/users/me').set('Authorization', `Bearer ${token}`);
    const { user } = getUserRes.body;

    const res = await agent
      .post('/lists')
      .set('Authorization', `Breaker ${token}`)
      .send(user.id);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'List successfully created' });
  });
});
