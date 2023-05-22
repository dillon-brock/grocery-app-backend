import { setupDb, signUpAndCreateCategory, signUpAndCreateList, testUser2 } from '../utils.js';
import { UserService } from '../../lib/services/UserService.js';

describe('DELETE /categories/:id tests', () => {
  beforeEach(setupDb);

  it('deletes category at DELETE /categories/:id', async () => {
    const { agent, token, categoryId, listId } = await signUpAndCreateCategory();

    const res = await agent
      .delete(`/categories/${categoryId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Category deleted successfully',
      category: {
        id: categoryId,
        listId,
        name: 'Bread'
      }
    });
  });

  it('deletes a category for user with edit access', async () => {
    const { agent, token, listId } = await signUpAndCreateList();
    const categoryRes = await agent.post('/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Bread', listId });
    const categoryId = categoryRes.body.category.id;

    const secondUser = await UserService.create(testUser2);

    await agent.post('/list-shares')
      .set('Authorization', `Bearer ${token}`)
      .send({ userId: secondUser.id, listId, editable: true });

    const signInRes = await agent.post('/users/sessions').send(testUser2);
    const { token: token2 } = signInRes.body;

    const res = await agent
      .delete(`/categories/${categoryId}`)
      .set('Authorization', `Bearer ${token2}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Category deleted successfully',
      category: {
        id: categoryId,
        name: 'Bread',
        listId
      }
    });
  });

  it('gives a 403 error for unauthorized user', async () => {
    const { agent, token, listId } = await signUpAndCreateList();
    const categoryRes = await agent.post('/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Bread', listId });
    const categoryId = categoryRes.body.category.id;

    const signUpRes = await agent.post('/users').send(testUser2);
    const { token: token2 } = signUpRes.body;

    const res = await agent
      .delete(`/categories/${categoryId}`)
      .set('Authorization', `Bearer ${token2}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toEqual('You are not authorized to access this category');
  });

  it('gives a 401 error for unauthenticated user', async () => {
    const { agent, token, listId } = await signUpAndCreateList();
    const categoryRes = await agent.post('/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Bread', listId });
    const categoryId = categoryRes.body.category.id;

    const res = await agent.delete(`/categories/${categoryId}`);

    expect(res.status).toBe(401);
    expect(res.body.message).toEqual('You must be signed in to continue');
  });
});
