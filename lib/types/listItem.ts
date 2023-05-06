import { Rows, SuccessResponse } from './global.js';

export type ListItemRows = Rows<ListItemFromDB>;
export type OwnerIDRows = Rows<{ owner_id: string }>;


export type ListItemFromDB = {
  id: string;
  list_id: string;
  item: string;
  bought: boolean;
  quantity: string | null;
  category_id: string | null;
};

export type NewListItemData = {
  listId: string;
  quantity: string;
  item: string;
  categoryId: string;
};

export type CoalescedListItem = {
  id: string;
  bought: boolean;
  item: string;
  quantity: string | null;
  categoryId: string | null;
}

export type ListItemUpdateData = {
  item?: string;
  bought?: boolean;
  quantity?: string;
  category_id?: string;
}

interface ListItem {
  id: string;
  bought: boolean;
  item: string;
  quantity: string | null;
  categoryId: string | null;
}

export interface ListItemRes extends SuccessResponse {
  listItem: ListItem;
}
