export type UserListFromDatabase = {
  id: string;
  user_id: string;
  list_id: string;
}

export type NewUserListData = {
  listId: string;
  userId: string;
}

export type UserListRows = {
  rows: UserListFromDatabase[];
}
