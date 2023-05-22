import { setupDb, signUpAndGetInfo } from '../utils.js';
import request from 'supertest';
import app from '../../lib/app.js';

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
          items: []
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
