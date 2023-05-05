import { Rows } from './global.js';
import { CoalescedListItem } from './listItem.js';

export type ListRows = Rows<ListFromDB>;
export type ListWithItemsRows = Rows<ListWithItemsFromDB>

export interface ListFromDB {
  id: string;
  owner_id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
}

export interface ListWithItemsFromDB extends ListFromDB {
  items: CoalescedListItem[];
}

export interface NewListData {
  title: string
}

export interface CreateListParams extends NewListData {
  ownerId: string;
}
