import { setupDb } from './utils.js';
import request from 'supertest';
import app from '../lib/app.js';

const testUser = {
  email: 'test@user.com',
  password: '123456',
  username: 'test_user'
};

const signUpAndGetInfo = async () => {
  const agent = request.agent(app);

  const signUpRes = await agent.post('/users').send(testUser);
  const { token } = signUpRes.body;
  const getUserRes = await agent.get('/users/me').set('Authorization', `Bearer ${token}`);
  const { user } = getUserRes.body;

  return { agent, token, user };
};

describe('list route tests', () => {
  beforeEach(setupDb);

  it('creates a new list on POST /lists', async () => {

    const { agent, token, user } = await signUpAndGetInfo();

    const res = await agent
      .post('/lists')
      .set('Authorization', `Breaker ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ 
      message: 'List successfully created', 
      list: {
        id: expect.any(String),
        ownerId: user.id
      } 
    });
  });

  it('serves a list with items at GET /lists/:id', async () => {
    
    const { agent, user, token } = await signUpAndGetInfo();

    const listPostRes = await agent
      .post('/lists')
      .set('Authorization', `Bearer ${token}`);
    const listId = listPostRes.body.list.id;

    const res = await agent.get(`/lists/${listId}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'List found',
      list: expect.objectContaining({
        id: expect.any(String),
        ownerId: user.id
      })
    });
  });
});
