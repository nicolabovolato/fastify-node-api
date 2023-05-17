export class NotFoundError extends Error {
  constructor(entityName: string, entityId: string | number) {
    super(`${entityName} '${entityId}' not found`);
  }
}

export class ConflictError extends Error {
  constructor(entityName: string) {
    super(`duplicate ${entityName}`);
  }
}

export class AuthError extends Error {
  type: "unauthorized" | "forbidden";
  constructor(message: "unauthorized" | "forbidden") {
    super(message);
    this.type = message;
  }
}
