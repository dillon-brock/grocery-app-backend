import { setupDb } from './utils.js';
import request from 'supertest';
import app from '../lib/app.js';

const testUser = {
  email: 'test@user.com',
  password: '123456',
  username: 'test_user'
};

const testRecipe = {
  name: 'mac and cheese',
  description: 'so cheesy and delicious'
};

const testStep = {
  num: 1,
  detail: 'boil the pasta'
};

type RecipeAgentData = {
  agent: request.SuperAgentTest;
  token: string;
  userId: string;
  recipeId: string;
}

async function signUpAndCreateRecipe(): Promise<RecipeAgentData> {
  const agent = request.agent(app);

  const signUpRes = await agent.post('/users').send(testUser);
  const { token } = signUpRes.body;

  const userRes = await agent.get('/users/me')
    .set('Authorization', `Bearer ${token}`);
  const userId = userRes.body.user.id;

  const newRecipeRes = await agent.post('/recipes')
    .set('Authorization', `Bearer ${token}`)
    .send(testRecipe);
  const recipeId = newRecipeRes.body.recipe.id;

  return { agent, token, userId, recipeId };
}

describe('POST /recipe-steps', () => {
  beforeEach(setupDb);

  it('adds a new step at POST /recipe-steps', async () =>  {
    const { agent, token, recipeId } = await signUpAndCreateRecipe();

    const res = await agent.post(`/recipe-steps?recipeId=${recipeId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(testStep);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Step added successfully',
      step: {
        ...testStep,
        id: expect.any(String),
        recipeId
      }
    });
  });
});
