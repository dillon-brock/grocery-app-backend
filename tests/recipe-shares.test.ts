/* @jest-environment node */
import { setupDb } from './utils.js';
import request from 'supertest';
import app from '../lib/app.js';
import { UserService } from '../lib/services/UserService.js';

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

const testRecipe = {
  name: 'mac and cheese',
  description: 'so cheesy and delicious'
};

type RecipeAgentData = {
  agent: request.SuperAgentTest;
  token: string;
  recipeId: string;
}

async function signUpAndCreateRecipe(): Promise<RecipeAgentData> {
  const agent = request.agent(app);

  const signUpRes = await agent.post('/users').send(testUser);
  const { token } = signUpRes.body;

  const recipeRes = await agent.post('/recipes')
    .set('Authorization', `Bearer ${token}`)
    .send(testRecipe);
  const recipeId = recipeRes.body.recipe.id;

  return { agent, token, recipeId };
}

describe('POST /recipe-shares tests', () => {
  beforeEach(setupDb);

  it('shares a recipe at POST /recipe-shares', async () => {
    const { agent, token, recipeId } = await signUpAndCreateRecipe();
    const secondUser = await UserService.create(testUser2);

    const res = await agent.post('/recipe-shares')
      .set('Authorization', `Bearer ${token}`)
      .send({ recipeId, userId: secondUser.id });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Recipe shared successfully',
      recipeShare: {
        id: expect.any(String),
        recipeId,
        userId: secondUser.id
      }
    });
  });
});
