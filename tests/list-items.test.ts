import { setupDb } from './utils.js';
import request from 'supertest';
import app from '../lib/app.js';

const testUser = {
  email: 'test@user.com',
  password: '123456',
  username: 'test_user'
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

describe('list item routes tests', () => {
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
