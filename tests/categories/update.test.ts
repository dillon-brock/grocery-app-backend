import { setupDb, signUpAndCreateCategory, signUpAndCreateList, testUser2 } from '../utils.js';
import { UserService } from '../../lib/services/UserService.js';

describe('PUT /categories/:id tests', () => {
  beforeEach(setupDb);

  it('updates a category at PUT /categories/:id', async () => {
    const { agent, token, listId } = await signUpAndCreateList();
    const categoryRes = await agent.post('/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Dessert', listId });
    const categoryId = categoryRes.body.category.id;

    const res = await agent
      .put(`/categories/${categoryId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Sweet Stuff' });
    
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Category updated successfully',
      category: {
        id: categoryId,
        name: 'Sweet Stuff',
        listId
      }
    });
  });

  it('updates a category for user with edit access', async () => {
    const { agent, token, listId } = await signUpAndCreateList();
    const categoryRes = await agent.post('/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Dessert', listId });
    const categoryId = categoryRes.body.category.id;

    const secondUser = await UserService.create(testUser2);

    await agent.post('/list-shares')
      .set('Authorization', `Bearer ${token}`)
      .send({ userId: secondUser.id, listId, editable: true });

    const signInRes = await agent.post('/users/sessions').send(testUser2);
    const { token: token2 } = signInRes.body;

    const res = await agent
      .put(`/categories/${categoryId}`)
      .set('Authorization', `Bearer ${token2}`)
      .send({ name: 'Sweet Stuff' });
    
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Category updated successfully',
      category: {
        id: categoryId,
        name: 'Sweet Stuff',
        listId
      }
    });
  });

  it('gives a 403 error for unauthorized user', async () => {
    const { agent, token, listId } = await signUpAndCreateList();
    const categoryRes = await agent.post('/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Dessert', listId });
    const categoryId = categoryRes.body.category.id;

    const signInRes = await agent.post('/users').send(testUser2);
    const { token: token2 } = signInRes.body;

    const res = await agent
      .put(`/categories/${categoryId}`)
      .set('Authorization', `Bearer ${token2}`)
      .send({ name: 'Sweet Stuff' });
    
    expect(res.status).toBe(403);
    expect(res.body.message).toEqual('You are not authorized to access this category');
  });

  it('gives a 401 error for unauthenticated user', async () => {
    const { agent, token, listId } = await signUpAndCreateList();
    const categoryRes = await agent.post('/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Dessert', listId });
    const categoryId = categoryRes.body.category.id;
    
    const res = await agent
      .put(`/categories/${categoryId}`)
      .send({ name: 'Sweet Stuff' });

    expect(res.status).toBe(401);
    expect(res.body.message).toEqual('You must be signed in to continue');
  });

  it('gives a 400 error with too many arguments', async () => {
    const { agent, token, categoryId } = await signUpAndCreateCategory();

    const res = await agent.put(`/categories/${categoryId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Sweet Stuff', other: 'bad data' });

    expect(res.status).toBe(400);
    expect(res.body.message).toEqual('Invalid payload - too many arguments');
  });

  it('gives a 400 error with too many arguments', async () => {
    const { agent, token, categoryId } = await signUpAndCreateCategory();

    const res = await agent.put(`/categories/${categoryId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: '' });

    expect(res.status).toBe(400);
    expect(res.body.message).toEqual('Invalid payload - name required');
  });

  it('gives a 400 error with too many arguments', async () => {
    const { agent, token, categoryId } = await signUpAndCreateCategory();

    const res = await agent.put(`/categories/${categoryId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: {} });

    expect(res.status).toBe(400);
    expect(res.body.message).toEqual('Invalid payload - name must be string');
  });
});
