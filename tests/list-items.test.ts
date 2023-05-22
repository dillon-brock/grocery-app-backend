import { createListWithCategory, createSecondaryUser, getNewItemId, setupDb, signUpAndGetInfo, testItem, testItem2, testItem3, testUser2 } from './utils.js';
import { UserService } from '../lib/services/UserService.js';


describe('POST /list-items tests', () => {
  beforeEach(setupDb);

  test('adds an item to a list at POST /list-items', async () => {
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

  test('adds item to list from user whom list is shared with', async () => {
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

  test('gives 403 error for shared user without edit access', async () => {
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

  test('gives a 403 error for unauthorized user adding element to list', async () => {
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

  test('gives a 404 error for nonexistent list', async () => {
    const { agent, token } = await signUpAndGetInfo();
    const { categoryId } = await createListWithCategory(agent, token);
    const res = await agent
      .post('/list-items?listId=2938')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...testItem, categoryId });
    
    expect(res.status).toBe(404);
    expect(res.body.message).toEqual('List not found');
  });

  test('gives a 401 error for unauthenticated user', async () => {
    const { agent, token } = await signUpAndGetInfo();
    const { listId, categoryId } = await createListWithCategory(agent, token);

    const res = await agent
      .post(`/list-items?listId=${listId}`)
      .send({ ...testItem, categoryId });
    
    expect(res.status).toBe(401);
    expect(res.body.message).toEqual('You must be signed in to continue');
  });
});



describe('POST /list-items/multiple', () => {
  beforeEach(setupDb);

  it('adds multiple items to list at POST /list-items/multiple', async () => {
    const { agent, token } = await signUpAndGetInfo();
    const { listId, categoryId } = await createListWithCategory(agent, token);

    const res = await agent.post(`/list-items/multiple?listId=${listId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ items: [
        { ...testItem, categoryId }, 
        { ...testItem2, categoryId }, 
        { ...testItem3, categoryId }
      ] });

    expect(res.status).toBe(200);
    expect(res.body.listItems.length).toBe(3);

  });

  it('adds multiple items to list for user with edit access', async () => {
    const { agent, token } = await signUpAndGetInfo();
    const { listId, categoryId } = await createListWithCategory(agent, token);
    const { token2, secondUserId } = await createSecondaryUser(agent);

    await agent.post('/list-shares')
      .set('Authorization', `Bearer ${token}`)
      .send({ listId, userId: secondUserId, editable: true });

    const res = await agent.post(`/list-items/multiple?listId=${listId}`)
      .set('Authorization', `Bearer ${token2}`)
      .send({ items: [
        { ...testItem, categoryId }, 
        { ...testItem2, categoryId }, 
        { ...testItem3, categoryId }
      ] });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Items added successfully',
      listItems: expect.any(Array)
    });
    expect(res.body.listItems.length).toBe(3);
    expect(res.body.listItems).toEqual(
      expect.arrayContaining([{
        ...testItem2,
        id: expect.any(String),
        categoryId,
        listId,
        bought: false
      }])
    );
  });
});


describe('PUT /list-items/:id tests', () => {
  beforeEach(setupDb);

  test('it updates an item at PUT /list-items/:id', async () => {
    const { agent, token } = await signUpAndGetInfo();
    const { listId, categoryId } = await createListWithCategory(agent, token);
    const newItemId = await getNewItemId(agent, token, listId, categoryId);
  
    const res = await agent
      .put(`/list-items/${newItemId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ bought: true });
  
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Item updated successfully',
      listItem: expect.objectContaining({
        ...testItem,
        bought: true,
        categoryId
      })
    });
  });

  test('it updates an item for shared user with edit access', async () => {
    const { agent, token } = await signUpAndGetInfo();
    const { listId, categoryId } = await createListWithCategory(agent, token);
    const newItemId = await getNewItemId(agent, token, listId, categoryId);

    const secondUser = await UserService.create(testUser2);

    await agent.post('/list-shares')
      .set('Authorization', `Bearer ${token}`)
      .send({ listId, userId: secondUser.id, editable: true });

    const signInRes = await agent.post('/users/sessions')
      .send(testUser2);
    const { token: token2 } = signInRes.body;

    const res = await agent
      .put(`/list-items/${newItemId}`)
      .set('Authorization', `Bearer ${token2}`)
      .send({ bought: true });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Item updated successfully',
      listItem: expect.objectContaining({
        ...testItem,
        bought: true,
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
      .send(testUser2);
    const { token: token2 } = signInRes.body;

    const res = await agent
      .put(`/list-items/${newItemId}`)
      .set('Authorization', `Bearer ${token2}`)
      .send({ bought: true });

    expect(res.status).toBe(403);
    expect(res.body.message).toEqual('You are not authorized to access this item');
  });

  test('gives a 404 error for nonexistent item', async () => {
    const { agent, token } = await signUpAndGetInfo();
    const res = await agent
      .put('/list-items/38942')
      .set('Authorization', `Bearer ${token}`)
      .send({ bought: true });

    expect(res.status).toBe(404);
    expect(res.body.message).toEqual('List item not found');
  });

  test('gives 401 error for unauthenticated user', async () => {
    const { agent, token } = await signUpAndGetInfo();
    const { listId, categoryId } = await createListWithCategory(agent, token);
    const newItemId = await getNewItemId(agent, token, listId, categoryId);

    const res = await agent
      .put(`/list-items/${newItemId}`)
      .send({ bought: true });

    expect(res.status).toBe(401);
    expect(res.body.message).toEqual('You must be signed in to continue');
  });

  test('gives a 403 error for unauthorized user', async () => {
    const { agent, token } = await signUpAndGetInfo();
    const { listId, categoryId } = await createListWithCategory(agent, token);
    const newItemId = await getNewItemId(agent, token, listId, categoryId);

    const secondUserRes = await agent
      .post('/users')
      .send(testUser2);
    const { token: token2 } = secondUserRes.body;

    const res = await agent
      .put(`/list-items/${newItemId}`)
      .set('Authorization', `Bearer ${token2}`)
      .send({ bought: true });

    expect(res.status).toBe(403);
    expect(res.body.message).toEqual('You are not authorized to access this item');
  });
});


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
