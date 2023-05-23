import { createListWithCategory, setupDb, signUpAndGetInfo, testItem, testUser2 } from '../utils.js';
import { UserService } from '../../lib/services/UserService.js';

describe('POST /list-items tests', () => {
  beforeEach(setupDb);

  it('adds an item to a list at POST /list-items', async () => {
    const { agent, token } = await signUpAndGetInfo();
    const { listId, categoryId } = await createListWithCategory(agent, token);

    const res = await agent
      .post(`/list-items?listId=${listId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ ...testItem, categoryId });
    
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Item added successfully',
      listItem: expect.objectContaining({ ...testItem, categoryId })
    });
  });

  it('adds item to list from user whom list is shared with', async () => {
    const { agent, token } = await signUpAndGetInfo();
    const { listId, categoryId } = await createListWithCategory(agent, token);

    const secondUser = await UserService.create(testUser2);

    await agent.post('/list-shares')
      .set('Authorization', `Bearer ${token}`)
      .send({ listId, userId: secondUser.id, editable: true });
    
    const signInRes = await agent
      .post('/users/sessions')
      .send({ email: testUser2.email, password: testUser2.password });
    const { token: token2 } = signInRes.body;

    const res = await agent
      .post(`/list-items?listId=${listId}`)
      .set('Authorization', `Bearer ${token2}`)
      .send({ ...testItem, categoryId });
    
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Item added successfully',
      listItem: expect.objectContaining({ ...testItem, categoryId })
    });
  });

  it('gives 403 error for shared user without edit access', async () => {
    const { agent, token } = await signUpAndGetInfo();
    const { listId, categoryId } = await createListWithCategory(agent, token);

    const secondUser = await UserService.create(testUser2);

    await agent.post('/list-shares')
      .set('Authorization', `Bearer ${token}`)
      .send({ listId, userId: secondUser.id, editable: false });
    
    const signInRes = await agent
      .post('/users/sessions')
      .send({ email: testUser2.email, password: testUser2.password });
    const { token: token2 } = signInRes.body;

    const res = await agent
      .post(`/list-items?listId=${listId}`)
      .set('Authorization', `Bearer ${token2}`)
      .send({ ...testItem, listId, categoryId });
    
    expect(res.status).toBe(403);
    expect(res.body.message).toEqual('You are not authorized to edit this list');
  });

  it('gives a 403 error for unauthorized user adding element to list', async () => {
    const { agent, token } = await signUpAndGetInfo();
    const { listId, categoryId } = await createListWithCategory(agent, token);

    const secondUserRes = await agent
      .post('/users')
      .send(testUser2);
    
    const { token: token2 } = secondUserRes.body;
    const res = await agent
      .post(`/list-items?listId=${listId}`)
      .set('Authorization', `Bearer ${token2}`)
      .send({ ...testItem, listId, categoryId });
    
    expect(res.status).toBe(403);
    expect(res.body.message).toEqual('You are not authorized to edit this list');
  });

  it('gives a 404 error for nonexistent list', async () => {
    const { agent, token } = await signUpAndGetInfo();
    const { categoryId } = await createListWithCategory(agent, token);
    const res = await agent
      .post('/list-items?listId=2938')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...testItem, categoryId });
    
    expect(res.status).toBe(404);
    expect(res.body.message).toEqual('List not found');
  });

  it('gives a 401 error for unauthenticated user', async () => {
    const { agent, token } = await signUpAndGetInfo();
    const { listId, categoryId } = await createListWithCategory(agent, token);

    const res = await agent
      .post(`/list-items?listId=${listId}`)
      .send({ ...testItem, categoryId });
    
    expect(res.status).toBe(401);
    expect(res.body.message).toEqual('You must be signed in to continue');
  });

  it('gives a 400 error for invalid argument', async () => {
    const { agent, token } = await signUpAndGetInfo();
    const { listId } = await createListWithCategory(agent, token);

    const res = await agent
      .post(`/list-items?listId=${listId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ ...testItem, other: 'bad data' });
    
    expect(res.status).toBe(400);
    expect(res.body.message).toEqual('Invalid payload - unexpected argument other');
  });

  it('gives a 400 error for incorrect type', async () => {
    const { agent, token } = await signUpAndGetInfo();
    const { listId, categoryId } = await createListWithCategory(agent, token);

    const res = await agent
      .post(`/list-items?listId=${listId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ ...testItem, categoryId, item: {} });
    
    expect(res.status).toBe(400);
    expect(res.body.message).toEqual('Invalid payload - item must be string');
  });

  it('gives a 400 error for missing argument', async () => {
    const { agent, token } = await signUpAndGetInfo();
    const { listId, categoryId } = await createListWithCategory(agent, token);

    const res = await agent
      .post(`/list-items?listId=${listId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ quantity: '5 lbs', categoryId });
    
    expect(res.status).toBe(400);
    expect(res.body.message).toEqual('Invalid payload - item is required');
  });

  it('gives a 400 error for invalid quantity type', async () => {
    const { agent, token } = await signUpAndGetInfo();
    const { listId, categoryId } = await createListWithCategory(agent, token);

    const res = await agent
      .post(`/list-items?listId=${listId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ ...testItem, categoryId, quantity: 5 });
    
    expect(res.status).toBe(400);
    expect(res.body.message).toEqual('Invalid payload - quantity must be string or null');
  });

});

