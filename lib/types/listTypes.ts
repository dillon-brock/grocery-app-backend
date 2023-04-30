import { CoalescedListItem } from './listItemTypes.js';

export interface ListFromDatabase {
  id: string;
  owner_id: string;
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
