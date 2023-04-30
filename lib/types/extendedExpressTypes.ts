import { type Request } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export interface AuthenticatedReqBody<T> extends AuthenticatedRequest {
  body: T
}

export interface AuthenticatedReqParams<T extends ParamsDictionary> extends AuthenticatedRequest {
  params: T
}

export interface TypedAuthenticatedRequest<T, U extends ParamsDictionary> extends AuthenticatedRequest {
  body: T,
  params: U
}
