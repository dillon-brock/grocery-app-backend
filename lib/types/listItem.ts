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

export interface NewListItemBody {
  quantity: string | null;
  item: string;
  categoryId: string;
}

export interface NewListItemData extends NewListItemBody {
  listId: string;
}

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
  quantity?: string | null;
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

export interface MultipleItemsRes extends SuccessResponse {
  listItems: ListItem[];
}
