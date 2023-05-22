import { createListWithCategory, createSecondaryUser, setupDb, signUpAndGetInfo, testItem, testItem2, testItem3 } from '../utils.js';

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
    expect(res.body).toEqual({
      message: 'Items added successfully',
      listItems: expect.any(Array)
    });
    expect(res.body.listItems.length).toBe(3);
    expect(res.body.listItems).toEqual(
      expect.arrayContaining([{
        ...testItem3,
        id: expect.any(String),
        listId,
        categoryId,
        bought: false
      }])
    );
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

  it('gives a 403 error for unauthorized user', async () => {
    const { agent, token } = await signUpAndGetInfo();
    const { listId, categoryId } = await createListWithCategory(agent, token);
    const { token2, secondUserId } = await createSecondaryUser(agent);

    await agent.post('/list-shares')
      .set('Authorization', `Bearer ${token}`)
      .send({ listId, userId: secondUserId, editable: false });

    const res = await agent.post(`/list-items/multiple?listId=${listId}`)
      .set('Authorization', `Bearer ${token2}`)
      .send({ items: [
        { ...testItem, categoryId }
      ] });

    expect(res.status).toBe(403);
    expect(res.body.message).toEqual('You are not authorized to edit this list');
  });

  it('gives a 401 error for unauthenticated user', async () => {
    const { agent, token } = await signUpAndGetInfo();
    const { listId, categoryId } = await createListWithCategory(agent, token);

    const res = await agent.post(`/list-items/multiple?listId=${listId}`)
      .send({ items: [
        { ...testItem, categoryId }
      ] });

    expect(res.status).toBe(401);
    expect(res.body.message).toEqual('You must be signed in to continue');
  });

  it('gives a 400 error for missing listId', async () => {
    const { agent, token } = await signUpAndGetInfo();
    const { categoryId } = await createListWithCategory(agent, token);

    const res = await agent.post('/list-items/multiple')
      .set('Authorization', `Bearer ${token}`)
      .send({ items: [
        { ...testItem, categoryId }
      ] });

    expect(res.status).toBe(400);
    expect(res.body.message).toEqual('Incomplete query (list not specified)');
  });
});
