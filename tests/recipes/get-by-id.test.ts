import { addIngredient, createRecipe, createRecipeStep, setupDb, signUp, testIngredient, testRecipe, testStep, testUser2 } from '../utils.js';
import { UserService } from '../../lib/services/UserService.js';

describe('GET /recipes/:id tests', () => {
  beforeEach(setupDb);

  it('gets a recipe by id at GET /recipes/:id', async () => {
    const { agent, token, userId } = await signUp();
    const recipeId = await createRecipe(agent, token);

    const res = await agent.get(`/recipes/${recipeId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Recipe found',
      recipe: {
        ...testRecipe,
        description: null,
        id: recipeId,
        ownerId: userId,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        ingredients: expect.any(Array),
        steps: expect.any(Array)
      }
    });
  });

  it('gets recipe detail', async () => {
    const { agent, token, userId } = await signUp();
    const recipeId = await createRecipe(agent, token);
    const stepId = await createRecipeStep(agent, token, recipeId);
    const ingredientId = await addIngredient(agent, token, recipeId);

    const res = await agent.get(`/recipes/${recipeId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Recipe found',
      recipe: {
        ...testRecipe,
        description: null,
        id: recipeId,
        ownerId: userId,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        steps: expect.arrayContaining([{
          ...testStep,
          id: stepId,
          recipeId
        }]),
        ingredients: expect.arrayContaining([{
          ...testIngredient,
          id: ingredientId,
          recipeId
        }])
      }
    });
  });

  it('gets a recipe by id for user with view access', async () => {
    const { agent, token, userId } = await signUp();
    const recipeId = await createRecipe(agent, token);

    const secondUser = await UserService.create(testUser2);

    await agent.post('/recipe-shares')
      .set('Authorization', `Bearer ${token}`)
      .send({ recipeId, userId: secondUser.id, editable: false });

    const signInRes = await agent.post('/users/sessions')
      .send(testUser2);
    const { token: token2 } = signInRes.body;

    const res = await agent.get(`/recipes/${recipeId}`)
      .set('Authorization', `Bearer ${token2}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Recipe found',
      recipe: {
        ...testRecipe,
        description: null,
        id: recipeId,
        ownerId: userId,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        ingredients: expect.any(Array),
        steps: expect.any(Array)
      }
    });
  });

  it('gives a 401 error for unauthenticated user', async () => {
    const { agent, token } = await signUp();
    const recipeId = await createRecipe(agent, token);

    const res = await agent.get(`/recipes/${recipeId}`);
    
    expect(res.status).toBe(401);
    expect(res.body.message).toEqual('You must be signed in to continue');
  });

  it('gives a 403 error for unauthorized user', async () => {
    const { agent, token } = await signUp();
    const recipeId = await createRecipe(agent, token);

    const signUpRes = await agent.post('/users')
      .send(testUser2);
    const { token: token2 } = signUpRes.body;

    const res = await agent.get(`/recipes/${recipeId}`)
      .set('Authorization', `Bearer ${token2}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toEqual('You do not have access to this recipe');
  });

  it('gives a 404 error for nonexistent recipe', async () => {
    const { agent, token } = await signUp();

    const res = await agent.get('/recipes/56891')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toEqual('Recipe not found');
  });
});
