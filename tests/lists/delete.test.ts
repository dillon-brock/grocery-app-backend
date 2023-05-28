import { createList, setupDb, signUpAndGetInfo, testUser2 } from '../utils.js';
import request from 'supertest';
import app from '../../lib/app.js';

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

