import { setupDb } from './utils.js';
import request from 'supertest';
import app from '../lib/app.js';

const testUser = {
  email: 'test@user.com',
  password: '123456',
  username: 'test_user'
};

const testUser2 = {
  email: 'test2@user.com',
  password: 'password',
  username: 'second_user'
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
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Test List' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ 
      message: 'List successfully created', 
      list: {
        id: expect.any(String),
        ownerId: user.id,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        title: 'Test List'
      } 
    });

    const listDetailRes = await agent
      .get(`/lists/${res.body.list.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(listDetailRes.body).toEqual({
      message: 'List found',
      list: expect.objectContaining({
        categories: expect.arrayContaining([{
          id: expect.any(String),
          name: 'Fruit',
          items: null
        }])
      })
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
  beforeEach(setupDb);

  it('serves a list with items at GET /lists/:id', async () => {

    const item = {
      item: 'Popsicles',
      quantity: 2
    };
    
    const { agent, user, token } = await signUpAndGetInfo();
    const listId = await createList(agent, token);

    const categoryRes = await agent.post('/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Sweet Things', listId });
    const categoryId = categoryRes.body.category.id;

    const itemRes = await agent.post('/list-items')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...item, listId, categoryId });
    const itemId = itemRes.body.listItem.id;

    const res = await agent
      .get(`/lists/${listId}`)
      .set('Authorization', `Bearer ${token}`);
  
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'List found',
      list: {
        id: listId,
        ownerId: user.id,
        categories: expect.arrayContaining([{
          id: categoryId,
          name: 'Sweet Things',
          items: [{
            id: itemId,
            item: 'Popsicles',
            quantity: 2,
            bought: false,
            categoryId
          }]
        }]),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        title: null
      }
    });
  });

  it('gives a 404 error for nonexistent list id', async () => {

    const { agent, token } = await signUpAndGetInfo();

    const res = await agent
      .get('/lists/1001')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('List not found');
  });

  // authentication errors
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

  
  // authorization errors
  it('gives a 403 error for unauthorized user', async () => {
    const { agent, token } = await signUpAndGetInfo();
    const listId = await createList(agent, token);

    const secondUserRes = await agent
      .post('/users')
      .send(testUser2);

    const { token: token2 } = secondUserRes.body;
    const res = await agent
      .get(`/lists/${listId}`)
      .set('Authorization', `Bearer ${token2}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('You are not authorized to access this list');
  });
});




describe('DELETE /lists/:id tests', () => {
  beforeEach(setupDb);

  it('deletes list at DELETE /lists/:id', async () => {
    const { agent, token, user } = await signUpAndGetInfo();
    const listId = await createList(agent, token);
  
    const res = await agent
      .delete(`/lists/${listId}`)
      .set('Authorization', `Bearer ${token}`);
  
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'List deleted successfully',
      list: {
        id: expect.any(String),
        ownerId: user.id,
        updatedAt: expect.any(String),
        createdAt: expect.any(String),
        title: null
      }
    });
  });

  it('gives a 404 error for nonexistent list id', async () => {

    const { agent, token } = await signUpAndGetInfo();

    const res = await agent
      .delete('/lists/1001')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('List not found');
  });

  // authentication errors
  it('gives a 401 error for unauthenticated user', async () => {

    const { agent, token } = await signUpAndGetInfo();
    const listId = await createList(agent, token);

    const res = await agent.delete(`/lists/${listId}`);

    expect(res.status).toBe(401);
    expect(res.body.message).toEqual('You must be signed in to continue');
  });

  it('gives 401 error for user with improper token format', async () => {
    const { agent, token } = await signUpAndGetInfo();
    const listId = await createList(agent, token);

    const res = await agent
      .delete(`/lists/${listId}`)
      .set('Authorization', `${token}`);
    expect(res.status).toBe(401);
    expect(res.body.message).toEqual('Invalid token');
  });

  it('gives 500 error for user with invalid token', async () => {
    const { agent, token } = await signUpAndGetInfo();
    const listId = await createList(agent, token);

    const res = await request(app)
      .delete(`/lists/${listId}`)
      .set('Authorization', 'Bearer bad-token');
    
    expect(res.status).toBe(500);
    expect(res.body.message).toBe('jwt malformed');
  });

  
  // authorization errors
  it('gives a 403 error for unauthorized user', async () => {
    const { agent, token } = await signUpAndGetInfo();
    const listId = await createList(agent, token);

    const secondUserRes = await agent
      .post('/users')
      .send(testUser2);

    const { token: token2 } = secondUserRes.body;
    const res = await agent
      .delete(`/lists/${listId}`)
      .set('Authorization', `Bearer ${token2}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('You are not authorized to access this list');
  });
});
