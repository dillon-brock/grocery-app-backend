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

async function createList(agent: request.SuperAgentTest, token: string): Promise<string> {
  
  const newListRes = await agent
    .post('/lists')
    .set('Authorization', `Bearer ${token}`);
  
  return newListRes.body.list.id;

}

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

  it('serves all current users lists at GET /lists', async () => {
    const { agent, token, user } = await signUpAndGetInfo();
    const newListId = await createList(agent, token);

    const res = await agent
      .get('/lists')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.lists[0])
      .toEqual(expect.objectContaining({
        id: newListId,
        ownerId: user.id
      }));
  });

  it('serves a list with items at GET /lists/:id', async () => {
    
    const { agent, user, token } = await signUpAndGetInfo();
    const listId = await createList(agent, token);

    const res = await agent
      .get(`/lists/${listId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'List found',
      list: expect.objectContaining({
        id: expect.any(String),
        ownerId: user.id
      })
    });
  });

  it('deletes list at DELETE /lists/:id', async () => {
    const { agent, token, user } = await signUpAndGetInfo();
    const listId = await createList(agent, token);

    const res = await agent
      .delete(`/lists/${listId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'List deleted successfully',
      list: expect.objectContaining({
        id: expect.any(String),
        ownerId: user.id
      })
    });
  });
});
