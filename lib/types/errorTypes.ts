export class ErrorWithStatus extends Error {
  
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export class DatabaseError extends ErrorWithStatus {
  table: string;

  constructor(table: string, message: string) {
    super(message, 500);
    this.table = table;
  }
}

export class InsertionError extends DatabaseError {

  constructor(table: string) {
    super(table, `Error occurred with insertion into ${table}`);
  }
}

export class UpdateError extends DatabaseError {
  constructor(table: string) {
    super(table, `Error occurred with update on ${table}`);
  }
}
