import { Rows } from './global.js';

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
