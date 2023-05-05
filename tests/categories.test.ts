import { setupDb } from './utils.js';
import request from 'supertest';
import app from '../lib/app.js';

const testUser = {
  email: 'test@user.com',
  password: '123456',
  username: 'test_user'
};

describe('POST /categories tests', () => {
  beforeEach(setupDb);

  it('creates new category at POST /categories', async () => {
    const agent = request.agent(app);
    const signUpRes = await agent.post('/users').send(testUser);
    const { token } = signUpRes.body;

    const listRes = await agent.post('/lists')
      .set('Authorization', `Bearer ${token}`);
    const listId = listRes.body.list.id;

    const res = await agent.post('/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Cheese', listId });
    
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Category created successfully',
      category: {
        id: expect.any(String),
        name: 'Cheese',
        listId
      }
    });
  });

  it('gives 401 error for unauthenticated user', async () => {
    const res = await request(app)
      .post('/categories')
      .send({ name: 'Bread' });

    expect(res.status).toBe(401);
    expect(res.body.message).toEqual('You must be signed in to continue');
  });
});
