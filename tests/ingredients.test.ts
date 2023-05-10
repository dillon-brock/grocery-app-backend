import { setupDb } from './utils.js';
import request from 'supertest';
import app from '../lib/app.js';
import { UserService } from '../lib/services/UserService.js';
import { Ingredient } from '../lib/models/Ingredient.js';

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


async function addIngredient(agent: request.SuperAgentTest, token: string, recipeId: string): Promise<string> {
  
  const res = await agent.post('/ingredients')
    .set('Authorization', `Bearer ${token}`)
    .send({ ...testIngredient, recipeId });

  return res.body.ingredient.id;
}


describe('PUT /ingredients/:id', () => {
  beforeEach(setupDb);

  it('updates an ingredient at PUT /ingredients/:id', async () => {
    const { agent, token, recipeId } = await signUpAndCreateRecipe();
    const ingredientId = await addIngredient(agent, token, recipeId);

    const res = await agent.put(`/ingredients/${ingredientId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'oat milk' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Ingredient updated successfully',
      ingredient: {
        id: ingredientId,
        name: 'oat milk',
        amount: '1 cup',
        recipeId
      }
    });
  });

  it('updates an ingredient for user with edit access', async () => {
    const { agent, token, recipeId } = await signUpAndCreateRecipe();
    const { token2, secondUserId } = await createSecondaryUser(agent);
    const ingredientId = await addIngredient(agent, token, recipeId);

    await agent.post('/recipe-shares')
      .set('Authorization', `Bearer ${token}`)
      .send({ userId: secondUserId, recipeId, editable: true });

    const res = await agent.put(`/ingredients/${ingredientId}`)
      .set('Authorization', `Bearer ${token2}`)
      .send({ amount: '2 cups' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Ingredient updated successfully',
      ingredient: {
        id: ingredientId,
        name: 'milk',
        amount: '2 cups',
        recipeId
      }
    });
  });

  it('gives a 403 error for unauthorized user', async () => {
    const { agent, token, recipeId } = await signUpAndCreateRecipe();
    const { token2, secondUserId } = await createSecondaryUser(agent);
    const ingredientId = await addIngredient(agent, token, recipeId);

    await agent.post('/recipe-shares')
      .set('Authorization', `Bearer ${token}`)
      .send({ userId: secondUserId, recipeId, editable: false });

    const res = await agent.put(`/ingredients/${ingredientId}`)
      .set('Authorization', `Bearer ${token2}`)
      .send({ amount: '2 cups' });

    expect(res.status).toBe(403);
    expect(res.body.message).toEqual('You are not authorized to edit this recipe');
  });

  it('gives a 401 error for unauthenticated user', async () => {
    const { agent, token, recipeId } = await signUpAndCreateRecipe();
    const ingredientId = await addIngredient(agent, token, recipeId);

    const res = await agent.put(`/ingredients/${ingredientId}`)
      .send({ amount: '2 cups' });

    expect(res.status).toBe(401);
    expect(res.body.message).toEqual('You must be signed in to continue');
  });

  it('gives a 404 error for nonexistent ingredient', async () => {
    const { agent, token } = await signUpAndCreateRecipe();

    const res = await agent.put('/ingredients/568902')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'oat milk' });

    expect(res.status).toBe(404);
    expect(res.body.message).toEqual('Ingredient not found');
  });
});


describe('GET /ingredients', () => {
  beforeEach(setupDb);

  it('gets a list of all ingredients corresponding to recipe at GET /ingredients', async () => {
    const { agent, token, recipeId } = await signUpAndCreateRecipe();
    const ingredientId = await addIngredient(agent, token, recipeId);

    const res = await agent.get(`/ingredients?recipeId=${recipeId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Ingredients found',
      ingredients: expect.arrayContaining([{
        ...testIngredient,
        id: ingredientId,
        recipeId
      }])
    });
  });

  it('gets a list of ingredients for user with view access', async () => {
    const { agent, token, recipeId } = await signUpAndCreateRecipe();
    const { token2, secondUserId } = await createSecondaryUser(agent);
    const ingredientId = await addIngredient(agent, token, recipeId);

    await agent.post('/recipe-shares')
      .set('Authorization', `Bearer ${token}`)
      .send({ userId: secondUserId, recipeId, editable: false });

    const res = await agent.get(`/ingredients?recipeId=${recipeId}`)
      .set('Authorization', `Bearer ${token2}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Ingredients found',
      ingredients: expect.arrayContaining([{
        ...testIngredient,
        id: ingredientId,
        recipeId
      }])
    });
  });

  it('gives a 403 error for unauthorized user', async () => {
    const { agent, recipeId } = await signUpAndCreateRecipe();
    const { token2 } = await createSecondaryUser(agent);

    const res = await agent.get(`/ingredients?recipeId=${recipeId}`)
      .set('Authorization', `Bearer ${token2}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toEqual('You are not authorized to view this recipe');
  });

  it('gives a 401 error for unauthenticated user', async () => {
    const { agent, recipeId } = await signUpAndCreateRecipe();

    const res = await agent.get(`/ingredients?recipeId=${recipeId}`);

    expect(res.status).toBe(401);
    expect(res.body.message).toEqual('You must be signed in to continue');
  });

  it('gives a 404 error for nonexistent recipe', async () => {
    const { agent, token } = await signUpAndCreateRecipe();

    const res = await agent.get('/ingredients?recipeId=3895')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toEqual('Recipe not found');
  });
});


describe('DELETE /ingredients/:id', () => {
  beforeEach(setupDb);

  it('deletes an ingredient at DELETE /ingredients/:id', async () => {
    const { agent, token, recipeId } = await signUpAndCreateRecipe();
    const ingredientId = await addIngredient(agent, token, recipeId);

    const res = await agent.delete(`/ingredients/${ingredientId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Ingredient deleted successfully',
      ingredient: {
        ...testIngredient,
        id: ingredientId,
        recipeId
      }
    });

    const ingredient = await Ingredient.findById(ingredientId);
    expect(ingredient).toBe(null);
  });

  it('deletes an ingredient for user with edit access', async () => {
    const { agent, token, recipeId } = await signUpAndCreateRecipe();
    const { token2, secondUserId } = await createSecondaryUser(agent);
    const ingredientId = await addIngredient(agent, token, recipeId);

    await agent.post('/recipe-shares')
      .set('Authorization', `Bearer ${token}`)
      .send({ userId: secondUserId, recipeId, editable: true });

    const res = await agent.delete(`/ingredients/${ingredientId}`)
      .set('Authorization', `Bearer ${token2}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Ingredient deleted successfully',
      ingredient: {
        ...testIngredient,
        id: ingredientId,
        recipeId
      }
    });

    const ingredient = await Ingredient.findById(ingredientId);
    expect(ingredient).toBe(null);
  });

  it('gives a 403 error for unauthorized user', async () => {
    const { agent, token, recipeId } = await signUpAndCreateRecipe();
    const { token2, secondUserId } = await createSecondaryUser(agent);
    const ingredientId = await addIngredient(agent, token, recipeId);

    await agent.post('/recipe-shares')
      .set('Authorization', `Bearer ${token}`)
      .send({ userId: secondUserId, recipeId, editable: false });

    const res = await agent.delete(`/ingredients/${ingredientId}`)
      .set('Authorization', `Bearer ${token2}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toEqual('You are not authorized to edit this recipe');
  });

  it('gives a 401 error for unauthenticated user', async () => {
    const { agent, token, recipeId } = await signUpAndCreateRecipe();
    const ingredientId = await addIngredient(agent, token, recipeId);

    const res = await agent.delete(`/ingredients/${ingredientId}`);

    expect(res.status).toBe(401);
    expect(res.body.message).toEqual('You must be signed in to continue');
  });
});
