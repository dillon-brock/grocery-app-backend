import express from 'express';
import usersRouter from './routes/users.js';
import listsRouter from './routes/lists.js';
import listItemsRouter from './routes/list-items.js';
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

// Error handling & 404 middleware for when
// a request doesn't match any app routes
app.use(notFoundMiddleWare);
app.use(errorMiddleware);

export default app;
