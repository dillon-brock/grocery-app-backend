import { setupDb, signUpAndGetListShareData, signUpAndShareList, testUser3 } from '../utils.js';
import { User } from '../../lib/models/User.js';

describe('GET /list-shares/users tests', () => {
  beforeEach(setupDb);

  it('gets users with whom list is shared at GET /list-shares/users', async () => {
    const { agent, listId, token, sharedUserId } = await signUpAndShareList();

    const sharedUser = await User.findById(sharedUserId);

    const res = await agent
      .get(`/list-shares/users?listId=${listId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Shared users found successfully',
      users: expect.any(Array)
    });
    expect(res.body.users[0]).toEqual({
      ...sharedUser
    });
  });

  it('gives a 401 error for unauthenticated user', async () => {
    const { agent, listId } = await signUpAndShareList();

    const res = await agent
      .get(`/list-shares/users?listId=${listId}`);

    expect(res.status).toBe(401);
    expect(res.body.message).toEqual('You must be signed in to continue');
  });

  it('gives a 403 error for unauthorized user', async () => {
    const { agent, listId } = await signUpAndGetListShareData();

    const signUpRes = await agent.post('/users').send(testUser3);
    const { token } = signUpRes.body;
    
    const res = await agent
      .get(`/list-shares/users?listId=${listId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toEqual('You are not authorized to view this information');
  });

  it('gives a 404 error for nonexistent list', async () => {
    const { agent, token } = await signUpAndShareList();

    const res = await agent
      .get('/list-shares/users?listId=458239')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toEqual('List not found');
  });
});
