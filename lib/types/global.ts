export type Rows<T> = {
  rows: T[]
}

export interface SuccessResponse {
  message: string
}

export interface Permissions {
  view: boolean;
  edit: boolean;
}
