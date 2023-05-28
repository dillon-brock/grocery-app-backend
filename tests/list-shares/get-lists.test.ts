import { setupDb, signUpAndShareList, testUser2 } from '../utils.js';
import { List } from '../../lib/models/List.js';


describe('GET /list-shares/lists tests', () => {
  beforeEach(setupDb);

  it('gets lists shared with user at GET /list-shares/lists', async () => {
    const { agent, sharedUserId, listId } = await signUpAndShareList();

    const signInRes = await agent
      .post('/users/sessions')
      .send(testUser2);
    const { token } = signInRes.body;

    const sharedList = await List.findById(listId);

    const res = await agent
      .get(`/list-shares/lists?userId=${sharedUserId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Shared lists found',
      sharedLists: expect.any(Array)
    });
    expect(res.body.sharedLists[0]).toEqual({ 
      ...sharedList,
      createdAt: expect.any(String),
      updatedAt: expect.any(String)
    });
  });

  it('gives a 401 error for unauthenticated user', async () => {
    const { agent, sharedUserId } = await signUpAndShareList();

    const res = await agent
      .get(`/list-shares/lists?userId=${sharedUserId}`);

    expect(res.status).toBe(401);
    expect(res.body.message).toEqual('You must be signed in to continue');
  });
});
