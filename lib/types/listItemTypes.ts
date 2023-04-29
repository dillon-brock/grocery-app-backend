export type ListItemFromDatabase = {
  id: string;
  list_id: string;
  bought: boolean;
  quantity: number | null;
};

export type NewListItemData = {
  listId: string;
  quantity: number;
};

export type ListItemRows = {
  rows: ListItemFromDatabase[];
};

export type CoalescedListItem = {
  id: string;
  bought: boolean;
  quantity: number;
}
