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

const testUser3 = {
  email: 'third@user.com',
  password: 'password',
  username: 'third_user'
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
      .send({ recipeId, userId: secondUser.id, editable: false });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Recipe shared successfully',
      recipeShare: {
        id: expect.any(String),
        recipeId,
        editable: false,
        userId: secondUser.id
      }
    });
  });

  it('gives a 403 error for unauthorized user', async () => {
    const { agent, recipeId } = await signUpAndCreateRecipe();

    const secondUser = await UserService.create(testUser2);
    const signUpRes = await agent.post('/users').send(testUser3);
    const { token } = signUpRes.body;

    const res = await agent.post('/recipe-shares')
      .set('Authorization', `Bearer ${token}`)
      .send({ userId: secondUser.id, recipeId, editable: true });

    expect(res.status).toBe(403);
    expect(res.body.message).toEqual('You are not authorized to share this recipe');

  });
});

describe('GET /recipe-shares/recipes tests', () => {
  beforeEach(setupDb);

  test('gets recipes shared with user at GET /recipes-shares/recipes', async () => {
    const { agent, token, recipeId } = await signUpAndCreateRecipe();

    const secondUser = await UserService.create(testUser2);
    await agent.post('/recipe-shares')
      .set('Authorization', `Bearer ${token}`)
      .send({ recipeId, userId: secondUser.id, editable: false });

    const signInRes = await agent.post('/users/sessions')
      .send(testUser2);
    const { token: token2 } = signInRes.body;

    const res = await agent.get('/recipe-shares/recipes')
      .set('Authorization', `Bearer ${token2}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Shared recipes found',
      recipes: expect.any(Array)
    });
    expect(res.body.recipes[0]).toEqual({
      ...testRecipe,
      id: recipeId,
      ownerId: expect.any(String),
      createdAt: expect.any(String),
      updatedAt: expect.any(String)
    });
  });
});
