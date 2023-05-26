import { setupDb, signUpAndGetListShareData, testUser3 } from '../utils.js';

describe('POST /list-shares (share list) tests', () => {
  beforeEach(setupDb);

  it('shares a list with a non-owner user at POST /list-shares', async () => {
    const { listId, userId, token, agent } = await signUpAndGetListShareData();

    const res = await agent.post('/list-shares')
      .set('Authorization', `Bearer ${token}`)
      .send({ listId, userId, editable: true });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'List shared successfully',
      shareData: {
        id: expect.any(String),
        userId,
        listId,
        editable: true
      }
    });
  });

  it('gives a 401 error for unauthenticated user', async () => {
    const { agent, listId, userId } = await signUpAndGetListShareData();

    const res = await agent.post('/list-shares')
      .send({ listId, userId, editable: true });

    expect(res.status).toBe(401);
    expect(res.body.message).toEqual('You must be signed in to continue');
  });
  
  it('gives a 404 error for nonexistent list', async () => {
    const { agent, token, userId } = await signUpAndGetListShareData();

    const res = await agent.post('/list-shares')
      .set('Authorization', `Bearer ${token}`)
      .send({ listId: '107', userId, editable: true });
    
    expect(res.status).toBe(404);
    expect(res.body.message).toEqual('List not found');
  });

  it('gives a 404 error for nonexistent user', async () => {
    const { agent, token, listId } = await signUpAndGetListShareData();

    const res = await agent.post('/list-shares')
      .set('Authorization', `Bearer ${token}`)
      .send({ listId, userId: '39492', editable: true });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('User not found');
  });

  it('gives a 403 error for user unauthorized to share list', async () => {
    const { agent, userId, listId } = await signUpAndGetListShareData();
    const secondSignUpRes = await agent.post('/users').send(testUser3);
    const { token: token2 } = secondSignUpRes.body;

    const res = await agent.post('/list-shares')
      .set('Authorization', `Bearer ${token2}`)
      .send({ listId, userId, editable: true });

    expect(res.status).toBe(403);
    expect(res.body.message).toEqual('You are not authorized to share this list');
  });

  it('gives a 400 error for missing listId', async () => {
    const { userId, token, agent } = await signUpAndGetListShareData();

    const res = await agent.post('/list-shares')
      .set('Authorization', `Bearer ${token}`)
      .send({ userId, editable: true });

    expect(res.status).toBe(400);
    expect(res.body.message).toEqual('Invalid payload - listId is required');
  });

  it('gives a 400 error for invalid listId type', async () => {
    const { userId, token, agent } = await signUpAndGetListShareData();

    const res = await agent.post('/list-shares')
      .set('Authorization', `Bearer ${token}`)
      .send({ listId: 1, userId, editable: true });

    expect(res.status).toBe(400);
    expect(res.body.message).toEqual('Invalid payload - listId must be string');
  });

  it('gives a 400 error for missing userId', async () => {
    const { listId, token, agent } = await signUpAndGetListShareData();

    const res = await agent.post('/list-shares')
      .set('Authorization', `Bearer ${token}`)
      .send({ listId, editable: true });

    expect(res.status).toBe(400);
    expect(res.body.message).toEqual('Invalid payload - userId is required');
  });

  it('gives a 400 error for invalid userId type', async () => {
    const { listId, token, agent } = await signUpAndGetListShareData();

    const res = await agent.post('/list-shares')
      .set('Authorization', `Bearer ${token}`)
      .send({ listId, userId: 1, editable: true });

    expect(res.status).toBe(400);
    expect(res.body.message).toEqual('Invalid payload - userId must be string');
  });

  it('gives a 400 error for missing editable value', async () => {
    const { listId, userId, token, agent } = await signUpAndGetListShareData();

    const res = await agent.post('/list-shares')
      .set('Authorization', `Bearer ${token}`)
      .send({ listId, userId });

    expect(res.status).toBe(400);
    expect(res.body.message).toEqual('Invalid payload - editable is required');
  });

  it('gives a 400 error for invalid editable type', async () => {
    const { listId, userId, token, agent } = await signUpAndGetListShareData();

    const res = await agent.post('/list-shares')
      .set('Authorization', `Bearer ${token}`)
      .send({ listId, userId, editable: 'true' });

    expect(res.status).toBe(400);
    expect(res.body.message).toEqual('Invalid payload - editable must be boolean');
  });

});
