import { Rows } from './global.js';

export type ListItemRows = Rows<ListItemFromDB>;
export type OwnerIDRows = Rows<{ owner_id: string }>;


export type ListItemFromDB = {
  id: string;
  list_id: string;
  item: string;
  bought: boolean;
  quantity: number | null;
  category_id: string | null;
};

export type NewListItemData = {
  listId: string;
  quantity: number;
  item: string;
  categoryId: string;
};

export type CoalescedListItem = {
  id: string;
  bought: boolean;
  item: string;
  quantity: number | null;
  categoryId: string | null;
}

export type ListItemUpdateData = {
  item?: string;
  bought?: boolean;
  quantity?: string;
  category_id?: string;
}
