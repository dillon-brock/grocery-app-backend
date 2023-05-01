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

describe('POST /lists tests', () => {
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

  it ('gives 401 error for unauthenticated users', async () => {
    const res = await request(app).post('/lists');
    expect(res.status).toBe(401);
    expect(res.body).toEqual({
      status: 401,
      message: 'You must be signed in to continue'
    });
  });

  it('gives 401 error for user with improper token format', async () => {
    const { agent, token } = await signUpAndGetInfo();
    const res = await agent
      .post('/lists')
      .set('Authorization', `${token}`);
    expect(res.status).toBe(401);
    expect(res.body.message).toEqual('Invalid token');
  });

  it('gives 500 error for user with invalid token', async () => {
    const res = await request(app)
      .post('/lists')
      .set('Authorization', 'Bearer bad-token');
    
    expect(res.status).toBe(500);
    expect(res.body.message).toBe('jwt malformed');
  });
});

describe('GET /lists tests', () => {
  beforeEach(setupDb);

  it('serves all current users lists at GET /lists', async () => {
    const { agent, token, user } = await signUpAndGetInfo();
    const newListId = await createList(agent, token);
  
    const res = await agent
      .get('/lists')
      .set('Authorization', `Bearer ${token}`);
  
    expect(res.status).toBe(200);
    expect(res.body).toEqual(expect.objectContaining({
      message: 'User\'s lists found',
    }));
    expect(res.body.lists[0])
      .toEqual(expect.objectContaining({
        id: newListId,
        ownerId: user.id
      }));
  });

  it('gives a 401 error for unauthenticated user', async () => {
    const res = await request(app).get('/lists');
    expect(res.status).toBe(401);
    expect(res.body.message).toEqual('You must be signed in to continue');
  });

  it('gives 401 error for user with improper token format', async () => {
    const { agent, token } = await signUpAndGetInfo();
    const res = await agent
      .get('/lists')
      .set('Authorization', `${token}`);
    expect(res.status).toBe(401);
    expect(res.body.message).toEqual('Invalid token');
  });

  it('gives 500 error for user with invalid token', async () => {
    const res = await request(app)
      .get('/lists')
      .set('Authorization', 'Bearer bad-token');
    
    expect(res.status).toBe(500);
    expect(res.body.message).toBe('jwt malformed');
  });

});


describe('GET /lists/:id tests', () => {
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

  it('gives a 401 error for unauthenticated user', async () => {

    const { agent, token } = await signUpAndGetInfo();
    const listId = await createList(agent, token);

    const res = await agent.get(`/lists/${listId}`);

    expect(res.status).toBe(401);
    expect(res.body.message).toEqual('You must be signed in to continue');
  });

  it('gives 401 error for user with improper token format', async () => {
    const { agent, token } = await signUpAndGetInfo();
    const listId = await createList(agent, token);

    const res = await agent
      .get(`/lists/${listId}`)
      .set('Authorization', `${token}`);
    expect(res.status).toBe(401);
    expect(res.body.message).toEqual('Invalid token');
  });

  it('gives 500 error for user with invalid token', async () => {
    const { agent, token } = await signUpAndGetInfo();
    const listId = await createList(agent, token);

    const res = await request(app)
      .get(`/lists/${listId}`)
      .set('Authorization', 'Bearer bad-token');
    
    expect(res.status).toBe(500);
    expect(res.body.message).toBe('jwt malformed');
  });
});


describe('DELETE /lists/:id tests', () => {
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
