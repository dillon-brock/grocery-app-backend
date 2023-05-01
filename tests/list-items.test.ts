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

const testItem = {
  item: 'bananas',
  quantity: 3,
};

async function signUpAndGetInfo() {
  const agent = request.agent(app);
  
  const signUpRes = await agent.post('/users').send(testUser);
  const { token } = signUpRes.body;
  const getUserRes = await agent.get('/users/me').set('Authorization', `Bearer ${token}`);
  const { user } = getUserRes.body;
  
  return { agent, token, user };
}

async function createList(agent: request.SuperAgentTest, token: string): Promise<string> {
  
  const newListRes = await agent
    .post('/lists')
    .set('Authorization', `Bearer ${token}`);
  
  return newListRes.body.list.id;

}

async function getNewItemId(agent: request.SuperAgentTest, token: string, listId: string): Promise<string> {

  const newItemRes = await agent
    .post('/list-items')
    .set('Authorization', `Bearer ${token}`)
    .send({ ...testItem, listId });
  
  return newItemRes.body.item.id;

}

describe('POST /list-items tests', () => {
  beforeEach(setupDb);

  test('it adds an item to a list at POST /list-items', async () => {
    const { agent, token } = await signUpAndGetInfo();
    const listId = await createList(agent, token);

    const res = await agent
      .post('/list-items')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...testItem, listId });
    
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Item added successfully',
      item: expect.objectContaining({ ...testItem })
    });
  });

  test('gives a 403 error for unauthorized user adding element to list', async () => {
    const { agent, token } = await signUpAndGetInfo();
    const newListRes = await agent
      .post('/lists')
      .set('Authorization', `Bearer ${token}`);
    const listId = newListRes.body.list.id;

    const secondUserRes = await agent
      .post('/users')
      .send(testUser2);
    
    const { token: token2 } = secondUserRes.body;
    const res = await agent
      .post('/list-items')
      .set('Authorization', `Bearer ${token2}`)
      .send({ ...testItem, listId });
    
    expect(res.status).toBe(403);
    expect(res.body.message).toEqual('You are not authorized to add items to this list');
  });

  test('gives a 404 error for nonexistent list', async () => {
    const { agent, token } = await signUpAndGetInfo();
    const res = await agent
      .post('/list-items')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...testItem, listId: '2398' });
    
    expect(res.status).toBe(404);
    expect(res.body.message).toEqual('List not found');
  });

  test('gives a 401 error for unauthenticated user', async () => {
    const { agent, token } = await signUpAndGetInfo();
    const newListRes = await agent
      .post('/lists')
      .set('Authorization', `Bearer ${token}`);
    const listId = newListRes.body.list.id;

    const res = await agent
      .post('/list-items')
      .send({ ...testItem, listId });
    
    expect(res.status).toBe(401);
    expect(res.body.message).toEqual('You must be signed in to continue');
  });

});

describe('PUT /list-items/:id tests', () => {
  test('it updates an item at PUT /list-items/:id', async () => {
    const { agent, token } = await signUpAndGetInfo();
    const listId = await createList(agent, token);
    const newItemId = await getNewItemId(agent, token, listId);
  
    const res = await agent
      .put(`/list-items/${newItemId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ bought: true });
  
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Item updated successfully',
      item: expect.objectContaining({
        ...testItem,
        bought: true
      })
    });
  });
});


describe('DELETE /list-items/:id tests', () => {
  it('deletes a item at DELETE /list-items/:id', async () => {
    const { agent, token } = await signUpAndGetInfo();
    const listId = await createList(agent, token);
    const newItemId = await getNewItemId(agent, token, listId);

    const res = await agent
      .delete(`/list-items/${newItemId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(expect.objectContaining({
      message: 'Item deleted successfully'
    }));
  });
});
