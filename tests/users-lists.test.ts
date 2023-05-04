/* @jest-environment node */
import { setupDb } from './utils.js';
import request from 'supertest';
import app from '../lib/app.js';
import { UserService } from '../lib/services/UserService.js';
import { User } from '../lib/models/User.js';

const testUser = {
  email: 'test@user.com',
  password: '123456',
  username: 'test_user'
};

const testUser2 = {
  email: 'test2@user.com',
  password: 'password',
  username: 'second_user'
};

const item = {
  item: 'banana',
  quantity: 3
};

describe('POST /users-lists (share list) tests', () => {
  beforeEach(setupDb);

  it('shares a list with a non-owner user at POST /users-lists', async () => {
    const agent = request.agent(app);
    const signUpRes = await agent.post('/users').send(testUser);
    const { token } = signUpRes.body;
    const otherUser: User = await UserService.create(testUser2);
    const newListRes = await agent
      .post('/lists')
      .set('Authorization', `Bearer ${token}`);
    const { list } = newListRes.body;

    const res = await agent.post('/users-lists')
      .set('Authorization', `Bearer ${token}`)
      .send({ listId: list.id, userId: otherUser.id });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'List shared successfully',
      shareData: {
        userId: otherUser.id,
        listId: list.id
      }
    });
  });
});
