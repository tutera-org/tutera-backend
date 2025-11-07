export class AppError extends Error {
  public statusCode: number;
  public errors?: unknown[] | undefined;

  constructor(message: string, statusCode: number = 500, errors?: unknown[]) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}
