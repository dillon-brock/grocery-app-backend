export type ListShareFromDatabase= {
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

export type ListShareRows = {
  rows: ListShareFromDatabase[];
}
