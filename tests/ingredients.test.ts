import { setupDb } from './utils.js';
import request from 'supertest';
import app from '../lib/app.js';
import { User } from '../lib/models/User.js';
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

const testIngredient = {
  name: 'milk',
  amount: '1 cup'
};

type RecipeAgentData = {
  agent: request.SuperAgentTest;
  token: string;
  userId: string;
  recipeId: string;
}

type SecondUserData = {
  token2: string;
  secondUserId: string;
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

async function createSecondaryUser(agent: request.SuperAgentTest): Promise<SecondUserData> {
  const secondUser = await UserService.create(testUser2);
  const secondUserId = secondUser.id;

  const signUpRes = await agent.post('/users/sessions').send(testUser2);
  const { token: token2 } = signUpRes.body;

  return { token2, secondUserId };
}

describe('POST /ingredients tests', () => {
  beforeEach(setupDb);

  it('adds a new ingredient at POST /ingredients', async () => {
    const { agent, token, recipeId } = await signUpAndCreateRecipe();

    const res = await agent.post('/ingredients')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...testIngredient, recipeId });
    
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Ingredient added successfully',
      ingredient: {
        ...testIngredient,
        id: expect.any(String),
        recipeId
      }
    });
  });

  it('adds a new ingredient for user with edit access', async () => {
    const { agent, token, recipeId } = await signUpAndCreateRecipe();
    const { token2, secondUserId } = await createSecondaryUser(agent);

    await agent.post('/recipe-shares')
      .set('Authorization', `Bearer ${token}`)
      .send({ userId: secondUserId, recipeId, editable: true });

    const res = await agent.post('/ingredients')
      .set('Authorization', `Bearer ${token2}`)
      .send({ ...testIngredient, recipeId });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Ingredient added successfully',
      ingredient: {
        ...testIngredient,
        id: expect.any(String),
        recipeId
      }
    });
  });

  it('gives a 401 error for unauthenticated user', async () => {
    const { agent, recipeId } = await signUpAndCreateRecipe();

    const res = await agent.post('/ingredients')
      .send({ ...testIngredient, recipeId });

    expect(res.status).toBe(401);
    expect(res.body.message).toEqual('You must be signed in to continue');
  });

  it('gives a 403 error for unauthorized user', async () => {
    const { agent, recipeId } = await signUpAndCreateRecipe();
    const { token2 } = await createSecondaryUser(agent);

    const res = await agent.post('/ingredients')
      .set('Authorization', `Bearer ${token2}`)
      .send({ ...testIngredient, recipeId });
    
    expect(res.status).toBe(403);
    expect(res.body.message).toEqual('You are not authorized to edit this recipe');
  });
});
