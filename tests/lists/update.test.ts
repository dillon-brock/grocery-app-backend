import { createList, createSecondaryUser, setupDb, signUpAndCreateList, signUpAndGetInfo } from '../utils.js';

describe('PUT /lists/:id', () => {
  beforeEach(setupDb);

  it('updates a list at PUT /lists/:id', async () => {
    const { agent, token, user } = await signUpAndGetInfo();
    const listId = await createList(agent, token);

    const res = await agent.put(`/lists/${listId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'new title' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'List updated successfully',
      list: {
        id: listId,
        ownerId: user.id,
        updatedAt: expect.any(String),
        createdAt: expect.any(String),
        title: 'new title'
      }
    });
  });

  it('updates a list for user with edit access', async () => {
    const { agent, token, user } = await signUpAndGetInfo();
    const listId = await createList(agent, token);
    const { token2, secondUserId } = await createSecondaryUser(agent);
    
    await agent.post('/list-shares')
      .set('Authorization', `Bearer ${token}`)
      .send({ listId, userId: secondUserId, editable: true });

    const res = await agent.put(`/lists/${listId}`)
      .set('Authorization', `Bearer ${token2}`)
      .send({ title: 'new title' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'List updated successfully',
      list: {
        id: listId,
        ownerId: user.id,
        updatedAt: expect.any(String),
        createdAt: expect.any(String),
        title: 'new title'
      }
    });
  });

  it('gives a 403 error for unauthorized user', async () => {
    const { agent, token } = await signUpAndGetInfo();
    const listId = await createList(agent, token);
    const { token2, secondUserId } = await createSecondaryUser(agent);
    
    await agent.post('/list-shares')
      .set('Authorization', `Bearer ${token}`)
      .send({ listId, userId: secondUserId, editable: false });

    const res = await agent.put(`/lists/${listId}`)
      .set('Authorization', `Bearer ${token2}`)
      .send({ title: 'new title' });

    expect(res.status).toEqual(403);
    expect(res.body.message).toEqual('You are not authorized to edit this list');
  });

  it('gives a 401 error for unauthenticated user', async () => {
    const { agent, token } = await signUpAndGetInfo();
    const listId = await createList(agent, token);

    const res = await agent.put(`/lists/${listId}`)
      .send({ title: 'new title' });

    expect(res.status).toBe(401);
    expect(res.body.message).toEqual('You must be signed in to continue');
  });

  it('gives a 404 error for nonexistent list', async () => {
    const { agent, token } = await signUpAndGetInfo();

    const res = await agent.put('/lists/58302')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'new title' });

    expect(res.status).toBe(404);
    expect(res.body.message).toEqual('List not found');
  });

  it('gives a 400 error for too many arguments', async () => {
    const { agent, token, listId } = await signUpAndCreateList();

    const res = await agent.put(`/lists/${listId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'new title', other: 'bad data' });

    expect(res.status).toBe(400);
    expect(res.body.message).toEqual('Invalid payload - too many arguments');
  });

  it('gives a 400 error for missing title', async () => {
    const { agent, token, listId } = await signUpAndCreateList();

    const res = await agent.put(`/lists/${listId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toEqual('Invalid payload - title required');
  });

  it('gives a 400 error for invalid title type', async () => {
    const { agent, token, listId } = await signUpAndCreateList();

    const res = await agent.put(`/lists/${listId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: { test: 'not a title' } });

    expect(res.status).toBe(400);
    expect(res.body.message).toEqual('Invalid payload - title must be string');
  });
});
