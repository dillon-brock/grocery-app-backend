import express from 'express';
import usersRouter from './routes/users';
import notFoundMiddleWare from './middleware/not-found';
import errorMiddleware from './middleware/error';

const app = express();

// Built in middleware
app.use(express.json());

// App routes
app.use('/users', usersRouter);

// Error handling & 404 middleware for when
// a request doesn't match any app routes
app.use(notFoundMiddleWare);
app.use(errorMiddleware);

export default app;
