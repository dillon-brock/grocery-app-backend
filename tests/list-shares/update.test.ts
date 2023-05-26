import { setupDb, signUp, signUpAndShareList, testUser3 } from '../utils.js';

describe('PUT /list-shares/:id', () => {
  beforeEach(setupDb);

  it('updates share data at PUT /list-shares/:id', async () => {
    const { listId, sharedUserId, token, agent, shareId } = await signUpAndShareList();

    const res = await agent.put(`/list-shares/${shareId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ editable: false });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'List share updated successfully',
      shareData: {
        id: shareId,
        userId: sharedUserId,
        listId,
        editable: false
      }
    });
  });

  it('gives a 401 error for unauthenticated user', async () => {
    const { agent, shareId } = await signUpAndShareList();

    const res = await agent.put(`/list-shares/${shareId}`)
      .send({ editable: false });

    expect(res.status).toBe(401);
    expect(res.body.message).toEqual('You must be signed in to continue');
  });

  it('gives a 403 error for unauthorized user', async () => {
    const { agent, shareId } = await signUpAndShareList();

    const secondSignUpRes = await agent.post('/users').send(testUser3);
    const { token: token2 } = secondSignUpRes.body;

    const res = await agent.put(`/list-shares/${shareId}`)
      .set('Authorization', `Bearer ${token2}`)
      .send({ editable: false });

    expect(res.status).toBe(403);
    expect(res.body.message).toEqual('You are not authorized to alter the sharing settings of this list');
  });

  it('gives a 404 error for nonexistent list share', async () => {
    const { agent, token } = await signUp();

    const res = await agent.put('/list-shares/48392')
      .set('Authorization', `Bearer ${token}`)
      .send({ editable: false });

    expect(res.status).toBe(404);
    expect(res.body.message).toEqual('List share data not found');
  });

  it('gives a 400 error for missing editable argument', async () => {
    const { token, agent, shareId } = await signUpAndShareList();

    const res = await agent.put(`/list-shares/${shareId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toEqual('Invalid payload - editable is required');
  });

  it('gives a 400 error for invalid type for editable', async () => {
    const { token, agent, shareId } = await signUpAndShareList();

    const res = await agent.put(`/list-shares/${shareId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ editable: 'false' });

    expect(res.status).toBe(400);
    expect(res.body.message).toEqual('Invalid payload - editable must be boolean');
  });
});
