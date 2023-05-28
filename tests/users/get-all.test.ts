/* @jest-environment node */
import { setupDb, signUpAndGetInfo, testUser4 } from '../utils.js';
import request from 'supertest';
import app from '../../lib/app.js';
import { UserService } from '../../lib/services/UserService.js';
import { testUser3 } from '../utils.js';

describe('GET /users', () => {
  beforeEach(setupDb);

  it('finds users by username at GET /users', async () => {
    const { agent, token } = await signUpAndGetInfo();
    const otherUser = await UserService.create(testUser4);
    await UserService.create(testUser3);

    const res = await agent.get('/users?username=test')
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.status).toEqual(200);
    expect(res.body.users.length).toBe(2);
    expect(res.body).toEqual({
      message: 'Users found',
      users: expect.arrayContaining([{
        id: otherUser.id,
        username: otherUser.username
      }])
    });
  });

  it('gives a 401 error for unauthenticated user', async () => {
    const res = await request(app).get('/users?username=test');

    expect(res.status).toBe(401);
    expect(res.body.message).toEqual('You must be signed in to continue');
  });

  it('returns different message if no users found', async () => {
    const { agent, token } = await signUpAndGetInfo();
    const res = await agent.get('/users?username=tuivjsdfk')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'No users found',
      users: []
    });
  });
});
