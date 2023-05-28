import { createList, setupDb, signUpAndGetInfo } from '../utils.js';
import request from 'supertest';
import app from '../../lib/app.js';

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
