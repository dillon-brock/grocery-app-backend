export type ListItemFromDatabase = {
  id: string;
  list_id: string;
  item: string;
  bought: boolean;
  quantity: number | null;
};

export type NewListItemData = {
  listId: string;
  quantity: number;
  item: string;
};

export type ListItemRows = {
  rows: ListItemFromDatabase[];
};

export type CoalescedListItem = {
  id: string;
  bought: boolean;
  item: string;
  quantity: number;
}