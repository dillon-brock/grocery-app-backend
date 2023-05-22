import { createListWithCategory, getNewItemId, setupDb, signUpAndGetInfo, testItem, testUser2 } from '../utils.js';
import { UserService } from '../../lib/services/UserService.js';

describe('DELETE /list-items/:id tests', () => {
  beforeEach(setupDb);

  it('deletes an item at DELETE /list-items/:id', async () => {
    const { agent, token } = await signUpAndGetInfo();
    const { listId, categoryId } = await createListWithCategory(agent, token);
    const newItemId = await getNewItemId(agent, token, listId, categoryId);

    const res = await agent
      .delete(`/list-items/${newItemId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Item deleted successfully',
      listItem: expect.objectContaining({
        ...testItem,
        categoryId
      })
    });
  });

  it('deletes an item for shared user with edit access', async () => {
    const { agent, token } = await signUpAndGetInfo();
    const { listId, categoryId } = await createListWithCategory(agent, token);
    const newItemId = await getNewItemId(agent, token, listId, categoryId);

    const secondUser = await UserService.create(testUser2);

    await agent.post('/list-shares')
      .set('Authorization', `Bearer ${token}`)
      .send({ listId, userId: secondUser.id, editable: true });

    const signInRes = await agent.post('/users/sessions')
      .send({ email: testUser2.email, password: testUser2.password });
    const { token: token2 } = signInRes.body;

    const res = await agent
      .delete(`/list-items/${newItemId}`)
      .set('Authorization', `Bearer ${token2}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Item deleted successfully',
      listItem: expect.objectContaining({
        ...testItem,
        categoryId
      })
    });
  });

  it('gives a 403 error for shared user without edit access', async () => {
    const { agent, token } = await signUpAndGetInfo();
    const { listId, categoryId } = await createListWithCategory(agent, token);
    const newItemId = await getNewItemId(agent, token, listId, categoryId);

    const secondUser = await UserService.create(testUser2);

    await agent.post('/list-shares')
      .set('Authorization', `Bearer ${token}`)
      .send({ listId, userId: secondUser.id, editable: false });

    const signInRes = await agent.post('/users/sessions')
      .send({ email: testUser2.email, password: testUser2.password });
    const { token: token2 } = signInRes.body;

    const res = await agent
      .delete(`/list-items/${newItemId}`)
      .set('Authorization', `Bearer ${token2}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toEqual('You are not authorized to access this item');
  });

  it('gives a 403 error for unauthorized user', async () => {
    const { agent, token } = await signUpAndGetInfo();
    const { listId, categoryId } = await createListWithCategory(agent, token);
    const newItemId = await getNewItemId(agent, token, listId, categoryId);

    const secondUserRes = await agent
      .post('/users')
      .send(testUser2);
    const { token: token2 } = secondUserRes.body;

    const res = await agent
      .delete(`/list-items/${newItemId}`)
      .set('Authorization', `Bearer ${token2}`);
    
    expect(res.status).toBe(403);
    expect(res.body.message).toEqual('You are not authorized to access this item');
  });

  it('gives a 401 error for unauthenticated user', async () => {
    const { agent, token } = await signUpAndGetInfo();
    const { listId, categoryId } = await createListWithCategory(agent, token);
    const newItemId = await getNewItemId(agent, token, listId, categoryId);

    const res = await agent.delete(`/list-items/${newItemId}`);

    expect(res.status).toBe(401);
    expect(res.body.message).toEqual('You must be signed in to continue');
  });
});
