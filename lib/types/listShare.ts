import { List } from '../models/List.js';
import { User } from '../models/User.js';
import { Rows, SuccessResponse } from './global.js';

export type ListShareRows = Rows<ListShareFromDB>

export type ListShareFromDB= {
  id: string;
  user_id: string;
  list_id: string;
  editable: boolean;
}

export type NewListShareData = {
  listId: string;
  userId: string;
  editable: boolean;
}

export type ListShareUpdateData = {
  editable: boolean;
}

interface ListShare {
  id: string;
  userId: string;
  listId: string;
  editable: boolean;
}

// response types
export interface ListShareRes extends SuccessResponse {
  shareData: ListShare;
}

export interface SharedListsRes extends SuccessResponse {
  sharedLists: List[];
}

export interface SharedUsersRes extends SuccessResponse {
  users: User[];
}
