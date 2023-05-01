import { CoalescedListItem } from './listItemTypes.js';

export interface ListFromDatabase {
  id: string;
  owner_id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
}

export interface ListRows {
  rows: ListFromDatabase[];
}

export interface ListWithItemsFromDatabase extends ListFromDatabase {
  items: CoalescedListItem[];
}

export type ListWithItemsRows = {
  rows: ListWithItemsFromDatabase;
}

export interface NewListData {
  title: string
}

export interface CreateListParams extends NewListData {
  ownerId: string;
}
