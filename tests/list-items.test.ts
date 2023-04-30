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

const signUpAndGetInfo = async () => {
  const agent = request.agent(app);

  const signUpRes = await agent.post('/users').send(testUser);
  const { token } = signUpRes.body;
  const getUserRes = await agent.get('/users/me').set('Authorization', `Bearer ${token}`);
  const { user } = getUserRes.body;

  return { agent, token, user };
};

describe('list item routes tests', () => {
  beforeEach(setupDb);

  test('it adds an item to a list at POST /items', async () => {
    const { agent, token } = await signUpAndGetInfo();

    const newListRes = await agent
      .post('/lists')
      .set('Authorization', `Bearer ${token}`);

    const listId = newListRes.body.list.id;
    
    const res = await agent
      .post('/items')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...testItem, listId });
    
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Item added successfully',
      item: expect.objectContaining({ ...testItem })
    });

  });
});
