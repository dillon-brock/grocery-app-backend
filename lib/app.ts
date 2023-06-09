import express from 'express';
import usersRouter from './routes/users.js';
import listsRouter from './routes/lists.js';
import listItemsRouter from './routes/list-items.js';
import listSharesRouter from './routes/list-shares.js';
import categoriesRouter from './routes/categories.js';
import recipesRouter from './routes/recipes.js';
import recipeSharesRouter from './routes/recipe-shares.js';
import ingredientsRouter from './routes/ingredients.js';
import recipeStepsRouter from './routes/recipe-steps.js';
import mealPlansRouter from './routes/meal-plans.js';
import plansRecipesRouter from './routes/plans-recipes.js';
import planSharesRouter from './routes/plan-shares.js';
import notFoundMiddleWare from './middleware/not-found.js';
import errorMiddleware from './middleware/error.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

// Built in middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors());

// App routes
app.use('/users', usersRouter);
app.use('/lists', listsRouter);
app.use('/list-items', listItemsRouter);
app.use('/list-shares', listSharesRouter);
app.use('/categories', categoriesRouter);
app.use('/recipes', recipesRouter);
app.use('/recipe-shares', recipeSharesRouter);
app.use('/ingredients', ingredientsRouter);
app.use('/recipe-steps', recipeStepsRouter);
app.use('/meal-plans', mealPlansRouter);
app.use('/plans-recipes', plansRecipesRouter);
app.use('/plan-shares', planSharesRouter);

// Error handling & 404 middleware for when
// a request doesn't match any app routes
app.use(notFoundMiddleWare);
app.use(errorMiddleware);

export default app;
