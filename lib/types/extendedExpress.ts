import { type Request } from 'express';
import { ParamsDictionary, Query } from 'express-serve-static-core';

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export interface AuthenticatedReqBody<T> extends AuthenticatedRequest {
  body: T
}

export interface AuthenticatedReqParams<T extends ParamsDictionary> extends AuthenticatedRequest {
  params: T
}

export interface AuthenticatedReqQuery<T extends Query> extends AuthenticatedRequest {
  query: T
}

export interface TypedAuthenticatedRequest<T, U extends ParamsDictionary> extends AuthenticatedRequest {
  body: T,
  params: U
}

export interface RequestWithBody<T> extends Request {
  body: T
}

export interface RequestWithParams<T extends ParamsDictionary> extends Request {
  params: T
}

export interface TypedRequest<T, U extends ParamsDictionary> extends Request {
  body: T,
  params: U
}
