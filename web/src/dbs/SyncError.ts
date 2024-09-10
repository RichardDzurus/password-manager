class SyncError extends Error {
  table: string;
  action: string;
  id: string;

  constructor(table: string, action: string, id: string, message: string) {
    super(message); // Call the base Error constructor
    this.name = 'SyncError'; // Set the error name to SyncError
    this.table = table;
    this.action = action;
    this.id = id;

    // Set the prototype explicitly for compatibility reasons in some environments
    Object.setPrototypeOf(this, SyncError.prototype);
  }

  // Optionally, you can provide a custom toString method to format the error message
  toString(): string {
    return `SyncError: [Table: ${this.table}, Action: ${this.action}, ID: ${this.id}] - ${this.message}`;
  }
}

export default SyncError;
