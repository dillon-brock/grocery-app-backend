import { type Request, type Response, type NextFunction } from "express";

// eslint-disable-next-line no-unused-vars
export default (err: any, req: Request, res: Response, next: NextFunction) => {
  const status = err.status || 500;

  res.status(status);

  if (process.env.NODE_ENV !== 'test') {
    console.error(err);
  }

  res.send({
    status,
    message: err.message,
  });
};
