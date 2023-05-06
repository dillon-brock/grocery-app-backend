import { Rows } from './global.js';

export type ListRows = Rows<ListFromDB>;
export type ListWithItemsRows = Rows<ListWithItemsFromDB>

export interface ListFromDB {
  id: string;
  owner_id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
}

export interface CoalescedListItem {
  id: string;
  item: string;
  quantity: number;
  bought: boolean;
  categoryId: string;
}

export interface CoalescedCategory {
  id: string;
  name: string;
  items: CoalescedListItem[];
}

export interface ListWithItemsFromDB extends ListFromDB {
  categories: CoalescedCategory[];
}

export interface NewListData {
  title: string
}

export interface CreateListParams extends NewListData {
  ownerId: string;
}
