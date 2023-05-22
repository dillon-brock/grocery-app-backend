import { setupDb, signUpAndCreateList, testUser2 } from '../utils.js';
import { UserService } from '../../lib/services/UserService.js';

describe('POST /categories tests', () => {
  beforeEach(setupDb);

  it('creates new category at POST /categories', async () => {
    const { agent, token, listId } = await signUpAndCreateList();

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

  it('creates new category for users with edit access', async () => {
    const { agent, token, listId } = await signUpAndCreateList();

    const secondUser = await UserService.create(testUser2);

    await agent.post('/list-shares')
      .set('Authorization', `Bearer ${token}`)
      .send({ userId: secondUser.id, listId, editable: true });

    const signInRes = await agent.post('/users/sessions').send(testUser2);
    const { token: token2 } = signInRes.body;

    const res = await agent.post('/categories')
      .set('Authorization', `Bearer ${token2}`)
      .send({ name: 'Frozen Food', listId });
    
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Category created successfully',
      category: {
        id: expect.any(String),
        name: 'Frozen Food',
        listId
      }
    });
  });

  it('gives a 403 error for unauthorized user', async () => {
    const { agent, listId } = await signUpAndCreateList();

    const signUpRes = await agent.post('/users').send(testUser2);
    const { token } = signUpRes.body;

    const res = await agent.post('/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Frozen Food', listId });

    expect(res.status).toBe(403);
    expect(res.body.message).toEqual('You are not authorized to edit this list');

  });

  it('gives 401 error for unauthenticated user', async () => {
    const { agent, listId } = await signUpAndCreateList();

    const res = await agent
      .post('/categories')
      .send({ name: 'Bread', listId });

    expect(res.status).toBe(401);
    expect(res.body.message).toEqual('You must be signed in to continue');
  });
});
